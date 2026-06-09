import { anilistRequest } from "./client";
import {
  AnimeDetailQuery,
  BrowseQuery,
  HomeQuery,
  MediaByIdsQuery,
  ScheduleQuery,
} from "./queries";
import type { BrowseFilters } from "@/lib/anilist/filters";
import type { SearchAnime } from "@/lib/supabase/search";

const HOUR = 3600;

/** Current calendar year — hero only shows this season year's cours. */
export function currentSeasonYear() {
  return new Date().getFullYear();
}

export function getHome() {
  return anilistRequest(HomeQuery, { heroYear: currentSeasonYear() }, 3 * HOUR);
}

export function getAnimeDetail(id: number) {
  return anilistRequest(AnimeDetailQuery, { id }, 24 * HOUR);
}

export function getBrowse(filters: BrowseFilters, page = 1) {
  // When searching with the default sort, rank by relevance instead of popularity.
  const sort =
    filters.search && filters.sort === "POPULARITY_DESC"
      ? "SEARCH_MATCH"
      : filters.sort;

  return anilistRequest(
    BrowseQuery,
    {
      page,
      sort: [sort],
      status: filters.status,
      season: filters.season,
      seasonYear: filters.year,
      genre: filters.genre,
      format: filters.format,
      search: filters.search,
    },
    HOUR,
  );
}

export function getSchedule(start: number, end: number, page = 1) {
  return anilistRequest(ScheduleQuery, { start, end, page }, HOUR);
}

/** Fetch up to 50 anime by AniList id (bookmark grids). */
export function getMediaByIds(ids: number[]) {
  return anilistRequest(MediaByIdsQuery, { ids: ids.slice(0, 50) }, HOUR);
}

/**
 * Live AniList title search, mapped to the same shape as the Supabase catalog.
 * Used as a fallback when the synced offline catalog has no rows for a query
 * (e.g. a freshly-airing title the dataset hasn't picked up yet). AniList only
 * matches whole words, so this complements — not replaces — the trigram search.
 * Cached for an hour so a repeated query doesn't re-hit AniList.
 */
export async function searchAnilist(
  query: string,
  page = 1,
): Promise<{ results: SearchAnime[]; hasNextPage: boolean }> {
  const term = query.trim();
  if (term.length < 2) return { results: [], hasNextPage: false };

  const data = await anilistRequest(
    BrowseQuery,
    { page, sort: ["SEARCH_MATCH"], search: term },
    HOUR,
  );

  const results: SearchAnime[] = (data.Page?.media ?? [])
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({
      anilist_id: m.id,
      title_romaji: m.title?.romaji ?? null,
      title_english: m.title?.english ?? null,
      cover_image: m.coverImage?.extraLarge ?? null,
      cover_color: m.coverImage?.color ?? null,
      format: m.format ?? null,
      season_year: m.seasonYear ?? null,
    }));

  return {
    results,
    hasNextPage: data.Page?.pageInfo?.hasNextPage ?? false,
  };
}

export type ScheduleEntry = {
  id: number;
  airingAt: number;
  episode: number;
  media: {
    id: number;
    title?: { romaji?: string | null; english?: string | null } | null;
    coverImage?: {
      extraLarge?: string | null;
      large?: string | null;
      color?: string | null;
    } | null;
    format?: string | null;
  };
};

/**
 * All non-adult episodes airing in the next 7 days, flattened and time-sorted.
 * Paginates a few times (50/page) which is plenty for one week; capped so a busy
 * week can't fan out into many AniList calls.
 */
export async function getWeekSchedule(): Promise<ScheduleEntry[]> {
  const start = Math.floor(Date.now() / 1000);
  const end = start + 7 * 24 * HOUR;
  const MAX_PAGES = 6;

  const entries: ScheduleEntry[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await getSchedule(start, end, page);
    const schedules = data.Page?.airingSchedules ?? [];
    for (const s of schedules) {
      if (!s?.media || s.media.isAdult) continue;
      entries.push({
        id: s.id,
        airingAt: s.airingAt,
        episode: s.episode,
        media: {
          id: s.media.id,
          title: s.media.title,
          coverImage: s.media.coverImage,
          format: s.media.format,
        },
      });
    }
    if (!data.Page?.pageInfo?.hasNextPage) break;
  }
  return entries;
}
