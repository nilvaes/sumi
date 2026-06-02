import { anilistRequest } from "./client";
import {
  AnimeDetailQuery,
  HomeQuery,
  ScheduleQuery,
  SearchQuery,
  SeasonQuery,
} from "./queries";
import type { MediaFormat, MediaSeason, MediaSort } from "./gql/graphql";

const HOUR = 3600;

export function getHome() {
  return anilistRequest(HomeQuery, undefined, 3 * HOUR);
}

export function getAnimeDetail(id: number) {
  return anilistRequest(AnimeDetailQuery, { id }, 24 * HOUR);
}

export function getSeason(params: {
  season: MediaSeason;
  seasonYear: number;
  page?: number;
  genres?: string[];
  format?: MediaFormat;
  sort?: MediaSort[];
}) {
  return anilistRequest(
    SeasonQuery,
    {
      season: params.season,
      seasonYear: params.seasonYear,
      page: params.page ?? 1,
      genres: params.genres,
      format: params.format,
      sort: params.sort ?? ["POPULARITY_DESC"],
    },
    6 * HOUR,
  );
}

export function searchAnime(search: string, page = 1) {
  return anilistRequest(SearchQuery, { search, page }, HOUR);
}

export function getSchedule(start: number, end: number, page = 1) {
  return anilistRequest(ScheduleQuery, { start, end, page }, HOUR);
}
