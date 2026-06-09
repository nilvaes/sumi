import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { BookmarkEntry, BookmarkMap, BookmarkStatus } from "./types";

type BookmarkRow = {
  anilist_id: number;
  status: BookmarkStatus;
  updated_at: string;
};

function toEntry(row: BookmarkRow): BookmarkEntry {
  return {
    anilistId: row.anilist_id,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

/** All bookmarks for the signed-in user as a map keyed by AniList id. */
export async function getBookmarkMapForUser(userId: string): Promise<BookmarkMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("anilist_id, status")
    .eq("user_id", userId);

  if (error) throw error;

  const map: BookmarkMap = {};
  for (const row of data ?? []) {
    map[row.anilist_id] = row.status;
  }
  return map;
}

/** Bookmarks for one tab, newest activity first. */
export async function getBookmarksByStatus(
  userId: string,
  status: BookmarkStatus,
): Promise<BookmarkEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("anilist_id, status, updated_at")
    .eq("user_id", userId)
    .eq("status", status)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toEntry);
}
