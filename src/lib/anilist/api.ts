import { anilistRequest } from "./client";
import { AnimeDetailQuery, BrowseQuery, HomeQuery, ScheduleQuery } from "./queries";
import type { BrowseFilters } from "./filters";

const HOUR = 3600;

export function getHome() {
  return anilistRequest(HomeQuery, undefined, 3 * HOUR);
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
