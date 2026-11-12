/**
 * Refreshes the anime catalog in Supabase that powers fast partial/fuzzy search.
 *
 * Source: manami-project/anime-offline-database (ODbL 1.0) — an openly licensed,
 * redistributable dataset, so this does NOT scrape or hoard the AniList API
 * (it makes zero AniList requests). Only entries with an AniList id are kept,
 * so click-through to our live AniList detail pages works.
 *
 * Safe to run any time; it never empties the table:
 *  - new anime are added, existing rows get updated values (a value the dataset
 *    doesn't have never blanks out one we already know),
 *  - rows the dataset doesn't know yet (the newest anime, added by the weekly
 *    AniList top-up) are kept,
 *  - entries the dataset tags as adult are removed.
 * A failure part-way leaves the previous data in place.
 *
 *   npm run sync              apply changes
 *   npm run sync -- --dry-run report what would change, write nothing
 *
 * (Weekly CI only runs the AniList top-up — see scripts/sync-anilist-gaps.ts.)
 */
import { createClient } from "@supabase/supabase-js";
import {
  anilistIdFromSources,
  entryToFields,
  isAdultEntry,
  mergeDatasetFields,
  type DatasetEntry,
  type DatasetFields,
} from "@/lib/sync/catalog";

const DRY_RUN = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// A dry run only reads (the anime table is publicly readable), so the public key
// is enough; writing needs the secret key.
const KEY = DRY_RUN
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

// The dataset is published as weekly GitHub releases; resolve the current one.
const RELEASE_API =
  "https://api.github.com/repos/manami-project/anime-offline-database/releases/latest";
const ASSET_NAME = "anime-offline-database-minified.json";

const READ_PAGE = 1000; // PostgREST's default max rows per request
const WRITE_BATCH = 500;
const DELETE_BATCH = 300; // ids per `in (...)`, keeps the URL short

if (!SUPABASE_URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Run via `npm run sync` (loads .env.local).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false },
});

async function datasetUrl(): Promise<string> {
  const res = await fetch(RELEASE_API, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`Release lookup failed (${res.status})`);
  const rel = (await res.json()) as {
    tag_name: string;
    assets: { name: string; browser_download_url: string }[];
  };
  const asset = rel.assets.find((a) => a.name === ASSET_NAME);
  if (!asset) throw new Error(`Asset ${ASSET_NAME} not found in release`);
  console.log(`Latest release: ${rel.tag_name}`);
  return asset.browser_download_url;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Every stored row's dataset-backed columns, keyed by AniList id. */
async function loadExisting(): Promise<Map<number, DatasetFields>> {
  const rows = new Map<number, DatasetFields>();
  for (let from = 0; ; from += READ_PAGE) {
    const { data, error } = await supabase
      .from("anime")
      .select("anilist_id, title_romaji, synonyms, cover_image, format, season_year, episodes")
      .order("anilist_id")
      .range(from, from + READ_PAGE - 1);
    if (error) throw new Error(`Reading existing rows failed: ${error.message}`);
    for (const { anilist_id, ...fields } of data ?? []) rows.set(anilist_id, fields);
    if (!data || data.length < READ_PAGE) break;
  }
  return rows;
}

async function main() {
  console.time("sync");
  if (DRY_RUN) console.log("Dry run: nothing will be written.\n");

  console.log("Resolving latest dataset release…");
  const url = await datasetUrl();

  console.log("Downloading anime-offline-database…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Dataset download failed (${res.status})`);
  const json = (await res.json()) as { data: DatasetEntry[] };

  const incoming = new Map<number, DatasetFields>();
  const adultIds = new Set<number>();
  for (const entry of json.data) {
    const id = anilistIdFromSources(entry.sources);
    if (id === null) continue;
    if (isAdultEntry(entry)) adultIds.add(id);
    else incoming.set(id, entryToFields(entry));
  }
  console.log(`Dataset: ${incoming.size} anime with AniList ids (${adultIds.size} adult skipped).`);

  console.log("Reading current catalog…");
  const existing = await loadExisting();
  console.log(`Catalog: ${existing.size} anime.`);

  const toWrite: (DatasetFields & { anilist_id: number; updated_at: string })[] = [];
  let added = 0;
  let updated = 0;
  const now = new Date().toISOString();
  for (const [id, fields] of incoming) {
    const before = existing.get(id);
    const { row, changed } = mergeDatasetFields(before, fields);
    if (!changed) continue;
    if (before) updated++;
    else added++;
    toWrite.push({ anilist_id: id, ...row, updated_at: now });
  }

  const adultToRemove = [...adultIds].filter((id) => existing.has(id));
  const keptNewer = [...existing.keys()].filter(
    (id) => !incoming.has(id) && !adultIds.has(id),
  ).length;

  console.log(
    `\nPlan: add ${added}, update ${updated}, remove ${adultToRemove.length} adult, ` +
      `keep ${keptNewer} not in the dataset yet (newest anime), ` +
      `leave ${existing.size - updated - adultToRemove.length - keptNewer} unchanged.`,
  );

  if (DRY_RUN) {
    console.timeEnd("sync");
    return;
  }

  // Only the dataset's columns are sent: on conflict PostgREST updates just these,
  // so English titles, genres and scores from the AniList top-up are preserved.
  let written = 0;
  for (const batch of chunk(toWrite, WRITE_BATCH)) {
    const { error } = await supabase
      .from("anime")
      .upsert(batch, { onConflict: "anilist_id" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    written += batch.length;
    if (written % 5000 < WRITE_BATCH) console.log(`  ${written}/${toWrite.length} written…`);
  }

  for (const ids of chunk(adultToRemove, DELETE_BATCH)) {
    const { error } = await supabase.from("anime").delete().in("anilist_id", ids);
    if (error) throw new Error(`Removing adult titles failed: ${error.message}`);
  }

  console.log(
    `\nDone. ${added} added, ${updated} updated, ${adultToRemove.length} adult removed.`,
  );
  console.timeEnd("sync");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
