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

/** Inactive ribbon: dark tab, white edge + icons. */
const INACTIVE_ICON = "text-white";

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
            "absolute inset-0 rounded-b-sm border-2 border-t-0 transition-colors duration-200",
            active
              ? "border-white/90 bg-brand shadow-md shadow-black/20"
              : "border-white bg-bg shadow-md shadow-black/40",
          )}
        />

        <div
          className={cn(
            "relative flex h-full flex-col items-center",
            active ? "text-white" : INACTIVE_ICON,
          )}
        >
          <div className={cn("shrink-0", compact ? "h-3.5" : "h-4")} />

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
                  active ? "hover:bg-white/10" : cn(INACTIVE_ICON, "hover:bg-white/10"),
                )}
                onClick={(e) => e.stopPropagation()}
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
                          : cn(INACTIVE_ICON, "bg-white/10")
                        : active
                          ? "text-white/90 hover:bg-white/10"
                          : cn(INACTIVE_ICON, "hover:bg-white/10"),
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
