import type {
  MediaFormat,
  MediaSeason,
  MediaSort,
  MediaStatus,
} from "./gql/graphql";
import { formatSeason, getCurrentSeason } from "@/lib/utils/season";

export type BrowseFilters = {
  sort: MediaSort;
  status?: MediaStatus;
  season?: MediaSeason;
  year?: number;
  genre?: string;
  format?: MediaFormat;
  search?: string;
};

export const SORT_OPTIONS: { value: MediaSort; label: string }[] = [
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "POPULARITY_DESC", label: "Popular" },
  { value: "SCORE_DESC", label: "Top rated" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "FAVOURITES_DESC", label: "Most favorited" },
];

export const STATUS_OPTIONS: { value: MediaStatus; label: string }[] = [
  { value: "RELEASING", label: "Airing" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "FINISHED", label: "Finished" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "HIATUS", label: "Hiatus" },
];

export const FORMAT_OPTIONS: { value: MediaFormat; label: string }[] = [
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
];

export const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export const SEASON_OPTIONS: { value: MediaSeason; label: string }[] = [
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

export function yearOptions(): number[] {
  const max = getCurrentSeason().year + 1;
  const years: number[] = [];
  for (let y = max; y >= 1990; y--) years.push(y);
  return years;
}

const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));
const STATUS_VALUES = new Set(STATUS_OPTIONS.map((o) => o.value));
const FORMAT_VALUES = new Set(FORMAT_OPTIONS.map((o) => o.value));
const SEASON_VALUES = new Set(SEASON_OPTIONS.map((o) => o.value));

type RawParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Read URL search params into a validated BrowseFilters object. */
export function parseBrowseFilters(params: RawParams): BrowseFilters {
  const sort = one(params.sort);
  const status = one(params.status);
  const season = one(params.season)?.toUpperCase();
  const format = one(params.format)?.toUpperCase();
  const genre = one(params.genre);
  const year = Number(one(params.year));
  const search = one(params.search)?.trim();

  return {
    sort:
      sort && SORT_VALUES.has(sort as MediaSort)
        ? (sort as MediaSort)
        : "POPULARITY_DESC",
    status:
      status && STATUS_VALUES.has(status as MediaStatus)
        ? (status as MediaStatus)
        : undefined,
    season:
      season && SEASON_VALUES.has(season as MediaSeason)
        ? (season as MediaSeason)
        : undefined,
    year: Number.isInteger(year) && year >= 1990 ? year : undefined,
    genre: genre && GENRE_OPTIONS.includes(genre) ? genre : undefined,
    format:
      format && FORMAT_VALUES.has(format as MediaFormat)
        ? (format as MediaFormat)
        : undefined,
    search: search || undefined,
  };
}

/** Serialize filters back into a query string (omitting defaults/empties). */
export function filtersToSearchParams(filters: BrowseFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.sort && filters.sort !== "POPULARITY_DESC") sp.set("sort", filters.sort);
  if (filters.status) sp.set("status", filters.status);
  if (filters.season) sp.set("season", filters.season);
  if (filters.year) sp.set("year", String(filters.year));
  if (filters.genre) sp.set("genre", filters.genre);
  if (filters.format) sp.set("format", filters.format);
  if (filters.search) sp.set("search", filters.search);
  return sp;
}

/** Human-readable heading for a given filter set. */
export function browseHeading(filters: BrowseFilters): string {
  if (filters.search) return `Results for “${filters.search}”`;
  if (filters.season && filters.year)
    return `${formatSeason(filters.season)} ${filters.year}`;
  if (filters.status) {
    const label = STATUS_OPTIONS.find((s) => s.value === filters.status)?.label;
    if (filters.status === "RELEASING") return "Airing now";
    if (filters.status === "NOT_YET_RELEASED") return "Upcoming";
    if (label) return label;
  }
  const sortLabel = SORT_OPTIONS.find((s) => s.value === filters.sort)?.label;
  return sortLabel ? sortLabel : "Browse";
}
