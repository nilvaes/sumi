import type { MediaFormat, MediaStatus } from "@/lib/anilist/gql/graphql";

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
  MANGA: "Manga",
  NOVEL: "Novel",
  ONE_SHOT: "One Shot",
};

const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Releasing",
  NOT_YET_RELEASED: "Not yet released",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export function formatLabel(format?: MediaFormat | null): string | null {
  return format ? (FORMAT_LABELS[format] ?? format) : null;
}

export function statusLabel(status?: MediaStatus | null): string | null {
  return status ? (STATUS_LABELS[status] ?? status) : null;
}

export function formatRelation(relation?: string | null): string | null {
  if (!relation) return null;
  return relation
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** AniList descriptions (asHtml:false) can still contain a few inline tags. */
export function stripHtml(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** "Ep 5 in 2d 4h" style countdown from a timeUntilAiring (seconds). */
export function formatCountdown(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function airingDate(airingAt: number): string {
  return new Date(airingAt * 1000).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
