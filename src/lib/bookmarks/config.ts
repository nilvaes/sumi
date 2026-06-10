import { Check, ListPlus, Play, type LucideIcon } from "lucide-react";
import type { BookmarkStatus } from "./types";

export const BOOKMARK_STATUS_META: Record<
  BookmarkStatus,
  { label: string; Icon: LucideIcon }
> = {
  watching: { label: "Watching", Icon: Play },
  planning: { label: "Planning", Icon: ListPlus },
  completed: { label: "Completed", Icon: Check },
};

export const RIBBON_STATUSES: BookmarkStatus[] = [
  "watching",
  "planning",
  "completed",
];
