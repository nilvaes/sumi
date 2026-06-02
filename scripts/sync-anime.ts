/**
 * Loads the anime catalog into Supabase to power fast partial/fuzzy search.
 *
 * Source: manami-project/anime-offline-database (ODbL 1.0) — an openly licensed,
 * redistributable dataset, so this does NOT scrape or hoard the AniList API.
 * Only entries that carry an AniList id are kept (so click-through to our live
 * AniList detail pages works).
 *
 * Run with:  npm run sync
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The dataset is published as weekly GitHub releases; resolve the current one.
const RELEASE_API =
  "https://api.github.com/repos/manami-project/anime-offline-database/releases/latest";
const ASSET_NAME = "anime-offline-database-minified.json";

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

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Run via `npm run sync` (loads .env.local).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

type Entry = {
  sources: string[];
  title: string;
  type: string;
  episodes: number | null;
  animeSeason?: { season?: string; year?: number | null };
  picture?: string | null;
  synonyms?: string[];
};

const FORMATS = new Set([
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
]);

function anilistId(sources: string[]): number | null {
  for (const url of sources) {
    const m = url.match(/anilist\.co\/anime\/(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
}

function toRow(e: Entry) {
  const id = anilistId(e.sources);
  if (id === null) return null;
  const format = FORMATS.has(e.type) ? e.type : null;
  return {
    anilist_id: id,
    title_romaji: e.title,
    title_english: null,
    title_native: null,
    synonyms: (e.synonyms ?? []).filter(Boolean),
    cover_image: e.picture ?? null,
    cover_color: null,
    format,
    season_year: e.animeSeason?.year ?? null,
    episodes: e.episodes ?? null,
    average_score: null,
    popularity: 0,
    genres: [] as string[],
    updated_at: new Date().toISOString(),
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  console.time("sync");

  console.log("Resolving latest dataset release…");
  const url = await datasetUrl();

  console.log("Downloading anime-offline-database…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Dataset download failed (${res.status})`);
  const json = (await res.json()) as { data: Entry[] };

  const rows = json.data
    .map(toRow)
    .filter((r): r is NonNullable<typeof r> => r !== null);
  console.log(`Parsed ${rows.length} anime with AniList ids.`);

  // Replace any previously stored (incl. earlier AniList-scraped) rows.
  console.log("Clearing existing rows…");
  const { error: delErr } = await supabase
    .from("anime")
    .delete()
    .gte("anilist_id", 0);
  if (delErr) throw new Error(`Delete failed: ${delErr.message}`);

  let inserted = 0;
  for (const batch of chunk(rows, 500)) {
    const { error } = await supabase
      .from("anime")
      .upsert(batch, { onConflict: "anilist_id" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    inserted += batch.length;
    if (inserted % 5000 === 0) console.log(`  ${inserted} inserted…`);
  }

  console.log(`\nDone. ${inserted} anime synced.`);
  console.timeEnd("sync");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
