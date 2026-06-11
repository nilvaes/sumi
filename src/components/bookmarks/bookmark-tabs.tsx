import Link from "next/link";
import { BOOKMARK_STATUS_META } from "@/lib/bookmarks/config";
import { BOOKMARK_TABS, type BookmarkStatus } from "@/lib/bookmarks/types";
import { cn } from "@/lib/utils";

export function BookmarkTabs({ active }: { active: BookmarkStatus }) {
  return (
    <div
      className={cn(
        "sticky top-14 z-40 -mx-4 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-bg/75",
      )}
    >
      <nav
        className="mx-auto flex max-w-6xl overflow-hidden rounded-sm border border-border bg-surface"
        aria-label="Bookmark categories"
      >
        {BOOKMARK_TABS.map(({ id, label }, index) => {
          const selected = id === active;
          const { Icon } = BOOKMARK_STATUS_META[id];
          return (
            <div key={id} className="flex min-w-0 flex-1">
              {index > 0 && (
                <div
                  className="w-px shrink-0 self-stretch bg-border"
                  aria-hidden
                />
              )}
              <Link
                href={`/bookmarks?tab=${id}`}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-xs transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm",
                  selected
                    ? "bg-bg font-medium text-text"
                    : "text-text-muted hover:bg-surface-hover hover:text-text",
                )}
                aria-current={selected ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0 sm:size-4",
                    selected ? "text-brand" : "text-text-muted",
                  )}
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function parseBookmarkTab(
  raw: string | string[] | undefined,
): BookmarkStatus {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "planning" || value === "completed") return value;
  return "watching";
}
