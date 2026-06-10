import Link from "next/link";
import { BOOKMARK_STATUS_META } from "@/lib/bookmarks/config";
import { BOOKMARK_TABS, type BookmarkStatus } from "@/lib/bookmarks/types";
import { cn } from "@/lib/utils";

export function BookmarkTabs({ active }: { active: BookmarkStatus }) {
  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-4"
      aria-label="Bookmark categories"
    >
      {BOOKMARK_TABS.map(({ id, label }) => {
        const selected = id === active;
        const { Icon } = BOOKMARK_STATUS_META[id];
        return (
          <Link
            key={id}
            href={`/bookmarks?tab=${id}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
              selected
                ? "border-brand bg-brand/10 text-text"
                : "border-border text-text-muted hover:border-brand/40 hover:text-text",
            )}
            aria-current={selected ? "page" : undefined}
          >
            <Icon
              className={cn("size-3.5 shrink-0", selected && "text-brand")}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function parseBookmarkTab(
  raw: string | string[] | undefined,
): BookmarkStatus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "planning" || value === "completed") return value;
  return "watching";
}
