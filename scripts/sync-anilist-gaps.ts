/**
 * Small weekly AniList top-up for the Supabase search catalog. Not a bulk mirror:
 * the bulk catalog comes from the offline dataset (scripts/sync-anime.ts).
 *
 * 1. Catch up on new anime: walk AniList newest-first (ID_DESC) and add anything
 *    missing, until reaching the newest anime we already had before this run.
 *    Nothing is skipped however long the job was paused (it used to stop after
 *    150, which would leave a permanent hole after a long pause).
 *    Usually 1 request; a long pause costs a few more (capped by MAX_PAGES).
 * 2. Refresh: re-check the stored anime that are still missing a year (newly
 *    announced titles often have none yet), least recently checked first, so
 *    they get their year, format, titles and cover once AniList has them.
 *    Ids AniList no longer returns as non-adult anime are removed from search.
 *
 * Typical cost: ~3 AniList requests per week.
 *
 *   npm run sync:gaps              apply changes
 *   npm run sync:gaps -- --dry-run report what would change, write nothing
 */
import { createClient } from "@supabase/supabase-js";
import { anilistRequest } from "@/lib/anilist/client";
import { GapFillQuery, MediaByIdsQuery } from "@/lib/anilist/queries";
import type { MediaCardFieldsFragment } from "@/lib/anilist/gql/graphql";
import { reachedHighWater } from "@/lib/sync/catalog";

const DRY_RUN = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// A dry run only reads (the anime table is publicly readable).
const KEY = DRY_RUN
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Safety cap for the catch-up: 20 pages × 50 = 1000 new anime (months of releases). */
const MAX_PAGES = 20;
/** Requests spent re-checking stored anime that are missing data (50 ids each). */
const REFRESH_REQUESTS = 2;
const PER_PAGE = 50;

if (!SUPABASE_URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Run via `npm run sync:gaps` (loads .env.local).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false },
});

/**
 * Columns AniList fills. Synonyms, native title and popularity aren't sent, so
 * new rows get the table defaults and existing rows keep their values.
 */
function toRow(m: MediaCardFieldsFragment) {
  return {
    anilist_id: m.id,
    title_romaji: m.title?.romaji ?? null,
    title_english: m.title?.english ?? null,
    cover_image: m.coverImage?.extraLarge ?? null,
    cover_color: m.coverImage?.color ?? null,
    format: m.format ?? null,
    season_year: m.seasonYear ?? null,
    episodes: m.episodes ?? null,
    average_score: m.averageScore ?? null,
    genres: (m.genres ?? []).filter((g): g is string => Boolean(g)),
    updated_at: new Date().toISOString(),
  };
}

function nonNull(media: (MediaCardFieldsFragment | null)[] | null | undefined) {
  return (media ?? []).filter((m): m is MediaCardFieldsFragment => Boolean(m));
}

async function write(rows: ReturnType<typeof toRow>[]) {
  if (DRY_RUN || rows.length === 0) return;
  const { error } = await supabase.from("anime").upsert(rows, { onConflict: "anilist_id" });
  if (error) throw new Error(`Upsert failed: ${error.message}`);
}

async function highWaterMark(): Promise<number> {
  const { data, error } = await supabase
    .from("anime")
    .select("anilist_id")
    .order("anilist_id", { ascending: false })
    .limit(1);
  if (error) throw new Error(`Reading newest id failed: ${error.message}`);
  return data?.[0]?.anilist_id ?? 0;
}

async function existingIds(ids: number[]): Promise<Set<number>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await supabase
    .from("anime")
    .select("anilist_id")
    .in("anilist_id", ids);
  if (error) throw new Error(`Lookup failed: ${error.message}`);
  return new Set((data ?? []).map((r) => r.anilist_id));
}

/** Step 1: add every anime newer than what we had. */
async function catchUp(): Promise<{ calls: number; added: Set<number> }> {
  const highWater = await highWaterMark();
  console.log(`Newest anime already stored: #${highWater}`);

  const added = new Set<number>();
  let calls = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await anilistRequest(GapFillQuery, { page }, 0);
    calls++;
    const media = nonNull(data.Page?.media);
    const ids = media.map((m) => m.id);

    const known = await existingIds(ids);
    const missing = media.filter((m) => !known.has(m.id));
    await write(missing.map(toRow));
    missing.forEach((m) => added.add(m.id));
    console.log(`  page ${page}: ${missing.length} new of ${ids.length}`);

    if (reachedHighWater(ids, highWater) || media.length < PER_PAGE) break;
    if (page === MAX_PAGES) {
      console.warn(
        `  stopped at the ${MAX_PAGES}-page cap before reaching #${highWater}; ` +
          "the next run continues from the new newest id, so run `npm run sync` " +
          "to fill anything in between.",
      );
    }
  }
  return { calls, added };
}

/** Step 2: re-check stored anime that are still missing their year. */
async function refreshIncomplete(skip: Set<number>): Promise<{ calls: number }> {
  const { data, error } = await supabase
    .from("anime")
    .select("anilist_id")
    .is("season_year", null)
    .order("updated_at", { ascending: true })
    .limit(REFRESH_REQUESTS * PER_PAGE + skip.size);
  if (error) throw new Error(`Reading incomplete rows failed: ${error.message}`);

  const ids = (data ?? [])
    .map((r) => r.anilist_id)
    .filter((id) => !skip.has(id))
    .slice(0, REFRESH_REQUESTS * PER_PAGE);

  let calls = 0;
  let improved = 0;
  const gone: number[] = [];
  for (let i = 0; i < ids.length; i += PER_PAGE) {
    const batch = ids.slice(i, i + PER_PAGE);
    const res = await anilistRequest(MediaByIdsQuery, { ids: batch }, 0);
    calls++;
    const media = nonNull(res.Page?.media);
    // Bump updated_at on every re-checked row so the next run moves on to others.
    await write(media.map(toRow));
    improved += media.filter((m) => m.seasonYear != null).length;

    // AniList returns only non-adult anime: anything else was deleted/merged
    // on AniList or is adult, and shouldn't be in search. Guard against an
    // empty response wiping a whole batch.
    if (media.length > 0) {
      const returned = new Set(media.map((m) => m.id));
      gone.push(...batch.filter((id) => !returned.has(id)));
    }
  }

  if (gone.length > 0 && !DRY_RUN) {
    const { error: delErr } = await supabase.from("anime").delete().in("anilist_id", gone);
    if (delErr) throw new Error(`Removing stale rows failed: ${delErr.message}`);
  }
  console.log(
    `Re-checked ${ids.length} anime missing a year: ${improved} now have one, ` +
      `${gone.length} no longer on AniList as non-adult anime${gone.length ? ` (${gone.join(", ")})` : ""}.`,
  );
  return { calls };
}

async function main() {
  console.time("sync:gaps");
  if (DRY_RUN) console.log("Dry run: nothing will be written.\n");

  const { calls: catchUpCalls, added } = await catchUp();
  console.log(`Added ${added.size} new anime.\n`);
  const { calls: refreshCalls } = await refreshIncomplete(added);

  console.log(`\nDone. ${catchUpCalls + refreshCalls} AniList request(s).`);
  console.timeEnd("sync:gaps");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
