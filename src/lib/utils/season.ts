import type { MediaSeason } from "@/lib/anilist/gql/graphql";

export const SEASONS: MediaSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

/**
 * AniList's seasonal calendar. December rolls into the *next* year's WINTER.
 */
export function getCurrentSeason(date = new Date()): {
  season: MediaSeason;
  year: number;
} {
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();

  if (month === 11) return { season: "WINTER", year: year + 1 };
  if (month <= 1) return { season: "WINTER", year };
  if (month <= 4) return { season: "SPRING", year };
  if (month <= 7) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export function formatSeason(season: MediaSeason): string {
  return season.charAt(0) + season.slice(1).toLowerCase();
}

export function isValidSeason(value: string): value is MediaSeason {
  return (SEASONS as string[]).includes(value.toUpperCase());
}
