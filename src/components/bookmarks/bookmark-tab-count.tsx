"use client";

import { useBookmarks } from "@/components/bookmarks/bookmark-provider";
import type { BookmarkStatus } from "@/lib/bookmarks/types";

/**
 * Live count for a bookmark tab, read from the client bookmark map so it
 * updates the moment a bookmark is added, moved or removed.
 */
export function BookmarkTabCount({ status }: { status: BookmarkStatus }) {
  const { map } = useBookmarks();
  let count = 0;
  for (const s of Object.values(map)) if (s === status) count++;

  return (
    <span className="shrink-0 tabular-nums text-text-muted">
      <span aria-hidden>{count}</span>
      <span className="sr-only">({count})</span>
    </span>
  );
}
