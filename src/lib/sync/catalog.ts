/*
  Pure helpers shared by the catalog sync scripts (scripts/sync-anime.ts and
  scripts/sync-anilist-gaps.ts). Kept free of I/O so they can be unit-tested.
*/

/** One entry of manami-project/anime-offline-database (fields we use). */
export type DatasetEntry = {
  sources: string[];
  title: string;
  type: string;
  episodes: number | null;
  animeSeason?: { season?: string; year?: number | null };
  picture?: string | null;
  synonyms?: string[];
  tags?: string[];
};

/** The columns the offline dataset can fill. Everything else is left untouched. */
export type DatasetFields = {
  title_romaji: string | null;
  synonyms: string[];
  cover_image: string | null;
  format: string | null;
  season_year: number | null;
  episodes: number | null;
};

const DATASET_FIELDS: (keyof DatasetFields)[] = [
  "title_romaji",
  "synonyms",
  "cover_image",
  "format",
  "season_year",
  "episodes",
];

const FORMATS = new Set(["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"]);

/** The dataset has no isAdult flag; adult titles carry these tags. */
const ADULT_TAGS = new Set(["hentai", "erotic game", "pornography"]);

export function anilistIdFromSources(sources: string[]): number | null {
  for (const url of sources) {
    const m = url.match(/anilist\.co\/anime\/(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
}

export function isAdultEntry(e: DatasetEntry): boolean {
  return (e.tags ?? []).some((t) => ADULT_TAGS.has(t.toLowerCase()));
}

export function entryToFields(e: DatasetEntry): DatasetFields {
  return {
    title_romaji: e.title || null,
    synonyms: (e.synonyms ?? []).filter(Boolean),
    cover_image: e.picture ?? null,
    format: FORMATS.has(e.type) ? e.type : null,
    season_year: e.animeSeason?.year ?? null,
    episodes: e.episodes ?? null,
  };
}

function present(v: unknown) {
  return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined;
}

/**
 * Columns only the AniList top-up writes. A row with any of them set came from
 * (or was refreshed from) AniList itself, which is the source of truth for ids,
 * titles and formats; the offline dataset sometimes differs (e.g. an English
 * title in the romaji slot).
 */
export type AniListMarkers = {
  title_english: string | null;
  cover_color: string | null;
  average_score: number | null;
  genres: string[];
};

export function hasAniListData(row: AniListMarkers): boolean {
  return (
    row.title_english !== null ||
    row.cover_color !== null ||
    row.average_score !== null ||
    row.genres.length > 0
  );
}

/**
 * Merge dataset values into an existing row. Never blanks out something we
 * already know (e.g. a year the weekly AniList refresh found before the dataset
 * caught up).
 * - Default: a dataset value wins when it has one.
 * - `keepExisting` (rows with AniList data): the dataset only fills fields we
 *   don't have yet, plus alternative titles (synonyms), which AniList's search
 *   fields don't give us.
 */
export function mergeDatasetFields(
  existing: DatasetFields | undefined,
  incoming: DatasetFields,
  { keepExisting = false }: { keepExisting?: boolean } = {},
): { row: DatasetFields; changed: boolean } {
  if (!existing) return { row: incoming, changed: true };

  const row = { ...existing };
  let changed = false;
  for (const key of DATASET_FIELDS) {
    const next = incoming[key];
    if (!present(next)) continue;
    if (keepExisting && key !== "synonyms" && present(existing[key])) continue;
    if (JSON.stringify(next) !== JSON.stringify(existing[key])) {
      (row as Record<string, unknown>)[key] = next;
      changed = true;
    }
  }
  return { row, changed };
}

/**
 * Weekly catch-up walks AniList newest-first. It can stop once a page reaches
 * the newest anime we already had before this run (the high-water mark):
 * everything above it has now been seen, so nothing is skipped no matter how
 * long the job was paused.
 */
export function reachedHighWater(pageIds: number[], highWater: number): boolean {
  return pageIds.length === 0 || Math.min(...pageIds) <= highWater;
}
