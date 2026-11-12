import type { BookmarkStatus } from "./types";

const STATUSES = new Set<BookmarkStatus>(["watching", "planning", "completed"]);

/** Postgres `integer` max; AniList ids are positive ints well below this. */
const MAX_ID = 2_147_483_647;

export function parseAnilistId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_ID
    ? value
    : null;
}

export function parseBookmarkStatus(value: unknown): BookmarkStatus | null {
  return typeof value === "string" && STATUSES.has(value as BookmarkStatus)
    ? (value as BookmarkStatus)
    : null;
}
