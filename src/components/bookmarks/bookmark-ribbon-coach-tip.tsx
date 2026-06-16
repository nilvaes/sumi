"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { BOOKMARK_STATUS_META, RIBBON_STATUSES } from "@/lib/bookmarks/config";
import { dismissRibbonTip } from "@/lib/bookmarks/ribbon-tip";
import { cn } from "@/lib/utils";

export const RIBBON_HOVER_DELAY_MS = 500;
export const COACH_TIP_SELECTOR = "[data-bookmark-coach-tip]";

const AUTO_CLOSE_MS = 3000;
const FADE_MS = 300;

const VIEWPORT_PAD = 12;
const TOOLTIP_WIDTH = 208; // w-52
const EST_HEIGHT = 180;

export function isFinePointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function clampRightAlignedLeft(anchorRight: number, vw: number): number {
  return Math.max(
    VIEWPORT_PAD + TOOLTIP_WIDTH,
    Math.min(anchorRight, vw - VIEWPORT_PAD),
  );
}

function computeTooltipStyle(rect: DOMRect): CSSProperties {
  const fine = isFinePointer();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!fine) {
    const left = clampRightAlignedLeft(rect.right, vw);
    const belowTop = rect.bottom + 8;
    const fitsBelow = belowTop + EST_HEIGHT <= vh - VIEWPORT_PAD;

    if (fitsBelow) {
      return {
        top: belowTop,
        left,
        width: TOOLTIP_WIDTH,
        transform: "translateX(-100%)",
      };
    }

    return {
      top: rect.top - 8,
      left,
      width: TOOLTIP_WIDTH,
      transform: "translate(-100%, -100%)",
    };
  }

  let left = rect.left - 8;
  if (left - TOOLTIP_WIDTH < VIEWPORT_PAD) {
    left = VIEWPORT_PAD + TOOLTIP_WIDTH;
  }

  let top = rect.top;
  if (top + EST_HEIGHT > vh - VIEWPORT_PAD) {
    top = Math.max(VIEWPORT_PAD, vh - VIEWPORT_PAD - EST_HEIGHT);
  }

  return {
    top,
    left,
    width: TOOLTIP_WIDTH,
    transform: "translateX(-100%)",
  };
}

export function BookmarkRibbonCoachTip({
  anchorRef,
  isLoggedIn,
  anilistId,
  onAutoClose,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  isLoggedIn: boolean;
  anilistId: number;
  onAutoClose: () => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    const fadeIn = setTimeout(() => setOpacity(1), 16);
    const fadeOut = setTimeout(() => setOpacity(0), AUTO_CLOSE_MS);
    const close = setTimeout(() => onAutoClose(), AUTO_CLOSE_MS + FADE_MS);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(close);
    };
  }, [onAutoClose]);

  useLayoutEffect(() => {
    if (!anchorRef.current) {
      setStyle(null);
      return;
    }

    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setStyle(computeTooltipStyle(rect));
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  if (!style || typeof document === "undefined") return null;

  const dismiss = () => {
    setOpacity(0);
    setTimeout(() => dismissRibbonTip(), FADE_MS);
  };

  return createPortal(
    <div
      data-bookmark-coach-tip=""
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "fixed z-[70] w-52 rounded-md border border-border bg-bg px-3 py-2.5 shadow-lg",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
      )}
      style={{ ...style, opacity }}
      role="tooltip"
    >
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        aria-label="Dismiss"
      >
        <X className="size-3.5" aria-hidden />
      </button>

      <p className="pr-5 text-xs leading-snug text-text-muted">
        Save anime to your lists:
      </p>
      <ul className="mt-2 space-y-1">
        {RIBBON_STATUSES.map((status) => {
          const { Icon, label } = BOOKMARK_STATUS_META[status];
          return (
            <li
              key={status}
              className="flex items-center gap-2 text-xs text-text"
            >
              <Icon className="size-3.5 shrink-0 text-brand" aria-hidden />
              {label}
            </li>
          );
        })}
      </ul>
      {!isLoggedIn && (
        <p className={cn("mt-2 border-t border-border pt-2 text-xs text-text-muted")}>
          <Link
            href={`/login?next=/anime/${anilistId}`}
            className="font-medium text-text transition-colors hover:text-brand"
            onClick={dismiss}
          >
            Sign in
          </Link>{" "}
          to save bookmarks.
        </p>
      )}
    </div>,
    document.body,
  );
}
