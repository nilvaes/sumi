/** All bookmark statuses (ribbon + /bookmarks tabs). */
export type BookmarkStatus = "watching" | "planning" | "completed";

export type BookmarkEntry = {
  anilistId: number;
  status: BookmarkStatus;
  updatedAt: string;
};

export type BookmarkMap = Record<number, BookmarkStatus>;

export const BOOKMARK_TABS: { id: BookmarkStatus; label: string }[] = [
  { id: "watching", label: "Watching" },
  { id: "planning", label: "Planning" },
  { id: "completed", label: "Completed" },
];
