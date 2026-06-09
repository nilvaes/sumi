"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import {
  removeBookmark,
  setBookmarkStatus,
} from "@/app/bookmarks/actions";
import { useBookmarks } from "@/components/bookmarks/bookmark-provider";
import {
  BOOKMARK_STATUS_META,
  RIBBON_STATUSES,
} from "@/lib/bookmarks/config";
import type { BookmarkStatus } from "@/lib/bookmarks/types";
import { cn } from "@/lib/utils";

/** Classic bookmark silhouette with a V-notch at the bottom. */
const BOOKMARK_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 7px), 50% 100%, 0 calc(100% - 7px))";

/** Inactive ribbon: dark tab, warm off-white edge + icons (matches `--text`). */
const INACTIVE_BORDER = "border-text/85";
const INACTIVE_ICON = "text-text/85";

type Props = {
  anilistId: number;
  /** Larger ribbon on the anime detail poster. */
  size?: "sm" | "lg";
  className?: string;
};

export function BookmarkRibbon({ anilistId, size = "sm", className }: Props) {
  const router = useRouter();
  const { map, isLoggedIn, patch } = useBookmarks();
  const current = map[anilistId] ?? null;
  const active = current !== null;

  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const expanded = hovered || pinned;
  const compact = size === "sm";

  const width = compact ? "w-7" : "w-9";
  const collapsedH = compact ? "h-10" : "h-12";
  const expandedH = compact ? "h-[7.5rem]" : "h-[8.75rem]";

  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setPinned(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  const stopNav = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onRootClick = useCallback(
    (e: MouseEvent) => {
      stopNav(e);
      if (!isLoggedIn) {
        router.push(`/login?next=/anime/${anilistId}`);
        return;
      }
      setPinned((p) => !p);
    },
    [anilistId, isLoggedIn, router, stopNav],
  );

  const pickStatus = useCallback(
    (status: BookmarkStatus) => {
      if (!isLoggedIn || pending) return;

      startTransition(async () => {
        try {
          if (current === status) {
            await removeBookmark(anilistId);
            patch(anilistId, null);
          } else {
            await setBookmarkStatus(anilistId, status);
            patch(anilistId, status);
          }
          setPinned(false);
        } catch {
          // Server action failed — provider state unchanged.
        }
      });
    },
    [anilistId, current, isLoggedIn, patch, pending],
  );

  const statusLabel = current
    ? BOOKMARK_STATUS_META[current].label
    : "Add bookmark";

  return (
    <div
      ref={rootRef}
      className={cn("absolute top-0 right-2 z-20", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={
        isLoggedIn
          ? active
            ? `Bookmarked as ${statusLabel}. Change bookmark.`
            : "Add bookmark"
          : "Sign in to bookmark"
      }
    >
      <div
        onClick={onRootClick}
        className={cn(
          width,
          "relative cursor-pointer transition-[height] duration-300 ease-out",
          expanded ? expandedH : collapsedH,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 border transition-colors duration-200",
            active
              ? "border-brand/60 bg-brand shadow-md shadow-black/20"
                  : cn(
                  "border-2 bg-bg/95 shadow-md shadow-black/40 backdrop-blur-sm",
                  INACTIVE_BORDER,
                ),
          )}
          style={{ clipPath: BOOKMARK_CLIP }}
        />

        <div
          className={cn(
            "relative flex h-full flex-col items-center",
            active ? "text-white" : INACTIVE_ICON,
          )}
        >
          <div
            className={cn(
              "shrink-0",
              compact ? "h-3.5" : "h-4",
              active && "flex items-end justify-center pb-0.5",
            )}
          >
            {active && (
              <span
                className={cn(
                  "rounded-full bg-white/85",
                  compact ? "size-1.5" : "size-2",
                )}
                aria-hidden
              />
            )}
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-start gap-0.5 overflow-hidden transition-opacity duration-300",
              expanded ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {!isLoggedIn ? (
              <Link
                href={`/login?next=/anime/${anilistId}`}
                className={cn(
                  "flex items-center justify-center rounded-sm p-1 transition-colors",
                  compact ? "size-7" : "size-8",
                  active ? "hover:bg-white/10" : cn(INACTIVE_ICON, "hover:bg-text/15 hover:text-text"),
                )}
                onClick={stopNav}
              >
                <LogIn className={compact ? "size-3.5" : "size-4"} aria-hidden />
                <span className="sr-only">Sign in to bookmark</span>
              </Link>
            ) : (
              RIBBON_STATUSES.map((status) => {
                const { Icon } = BOOKMARK_STATUS_META[status];
                const selected = current === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={pending}
                    aria-label={BOOKMARK_STATUS_META[status].label}
                    className={cn(
                      "flex items-center justify-center rounded-sm transition-colors disabled:opacity-50",
                      compact ? "size-7" : "size-8",
                      selected
                        ? active
                          ? "bg-white/20 text-white"
                          : cn(INACTIVE_ICON, "bg-text/10")
                        : active
                          ? "text-white/90 hover:bg-white/10"
                          : cn(INACTIVE_ICON, "hover:bg-text/15 hover:text-text"),
                    )}
                    onClick={(e) => {
                      stopNav(e);
                      pickStatus(status);
                    }}
                  >
                    <Icon className={compact ? "size-3.5" : "size-4"} aria-hidden />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
