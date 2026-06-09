/**
 * Bounded AniList top-up for the Supabase search index.
 *
 * Fetches the newest anime by id (ID_DESC), upserts
 * only rows missing from Postgres, and stops when a page is already fully indexed.
 * Typical cost: 1–3 API calls/week — not a bulk catalog mirror.
 *
 * Run after `npm run sync`:  npm run sync:gaps
 */
import { createClient } from "@supabase/supabase-js";
import { anilistRequest } from "@/lib/anilist/client";
import { GapFillQuery } from "@/lib/anilist/queries";
import type { MediaCardFieldsFragment } from "@/lib/anilist/gql/graphql";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_PAGES = 3; // 50 per page → up to 150 newest anime per run

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Run via `npm run sync:gaps` (loads .env.local).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

type AnimeRow = {
  anilist_id: number;
  title_romaji: string | null;
  title_english: string | null;
  title_native: string | null;
  synonyms: string[];
  cover_image: string | null;
  cover_color: string | null;
  format: string | null;
  season_year: number | null;
  episodes: number | null;
  average_score: number | null;
  popularity: number;
  genres: string[];
  updated_at: string;
};

function toRow(m: MediaCardFieldsFragment): AnimeRow {
  return {
    anilist_id: m.id,
    title_romaji: m.title?.romaji ?? null,
    title_english: m.title?.english ?? null,
    title_native: null,
    synonyms: [],
    cover_image: m.coverImage?.extraLarge ?? null,
    cover_color: m.coverImage?.color ?? null,
    format: m.format ?? null,
    season_year: m.seasonYear ?? null,
    episodes: m.episodes ?? null,
    average_score: m.averageScore ?? null,
    popularity: 0,
    genres: (m.genres ?? []).filter((g): g is string => Boolean(g)),
    updated_at: new Date().toISOString(),
  };
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

async function main() {
  console.time("sync:gaps");
  let apiCalls = 0;
  let upserted = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await anilistRequest(GapFillQuery, { page }, 0);
    apiCalls++;

    const media = (data.Page?.media ?? []).filter(
      (m): m is MediaCardFieldsFragment => Boolean(m),
    );
    if (media.length === 0) {
      console.log(`Page ${page}: no results — done.`);
      break;
    }

    const ids = media.map((m) => m.id);
    const known = await existingIds(ids);
    const missing = media.filter((m) => !known.has(m.id));

    if (missing.length === 0) {
      console.log(
        `Page ${page}: all ${ids.length} ids already indexed — caught up.`,
      );
      break;
    }

    const rows = missing.map(toRow);
    const { error } = await supabase
      .from("anime")
      .upsert(rows, { onConflict: "anilist_id" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);

    upserted += rows.length;
    console.log(
      `Page ${page}: upserted ${rows.length} new (${known.size}/${ids.length} already had).`,
    );
  }

  console.log(`\nDone. ${upserted} new anime, ${apiCalls} AniList call(s).`);
  console.timeEnd("sync:gaps");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
