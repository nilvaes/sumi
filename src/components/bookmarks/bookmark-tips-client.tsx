"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { BOOKMARK_STATUS_META, RIBBON_STATUSES } from "@/lib/bookmarks/config";
import { cn } from "@/lib/utils";

const STORAGE = {
  legend: "sumi:dismissed-bookmark-legend",
  signIn: "sumi:dismissed-bookmark-signin",
} as const;

const tipListeners = new Set<() => void>();
const sessionDismissed = new Set<string>();

function subscribeTips(onChange: () => void) {
  tipListeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("sumi:dismissed-bookmark")) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    tipListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readDismissed(key: string): boolean {
  if (sessionDismissed.has(key)) return true;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function dismissTip(key: string) {
  sessionDismissed.add(key);
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Private browsing — session-only via sessionDismissed.
  }
  tipListeners.forEach((l) => l());
}

/** Server snapshot: treat as dismissed so tips don't flash before hydration. */
function serverDismissed(): boolean {
  return true;
}

function useTipDismissed(key: string): boolean {
  return useSyncExternalStore(
    subscribeTips,
    () => readDismissed(key),
    serverDismissed,
  );
}

function TipBox({
  className,
  onDismiss,
  children,
}: {
  className?: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative rounded-md pr-10", className)}>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        aria-label="Dismiss"
      >
        <X className="size-4" aria-hidden />
      </button>
      {children}
    </div>
  );
}

export function BookmarkTipsClient({ showSignInTip }: { showSignInTip: boolean }) {
  const legendDismissed = useTipDismissed(STORAGE.legend);
  const signInDismissed = useTipDismissed(STORAGE.signIn);

  const legendVisible = !legendDismissed;
  const signInVisible = showSignInTip && !signInDismissed;

  if (!legendVisible && !signInVisible) return null;

  return (
    <div className="space-y-3">
      {legendVisible && (
        <TipBox
          className="border border-brand/15 bg-brand/5 px-4 py-3"
          onDismiss={() => dismissTip(STORAGE.legend)}
        >
          <p className="text-center text-xs leading-relaxed text-text-muted sm:text-sm">
            Hover the bookmark on any poster to save anime.{" "}
            <span className="mt-1.5 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {RIBBON_STATUSES.map((status) => {
                const { Icon, label } = BOOKMARK_STATUS_META[status];
                return (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1.5 text-text"
                  >
                    <Icon className="size-3.5 shrink-0 text-brand" aria-hidden />
                    {label}
                  </span>
                );
              })}
            </span>
          </p>
        </TipBox>
      )}

      {signInVisible && (
        <TipBox
          className="border border-border bg-surface px-4 py-3"
          onDismiss={() => dismissTip(STORAGE.signIn)}
        >
          <p className="text-center text-xs leading-relaxed text-text-muted sm:text-sm">
            <Link
              href="/login"
              className="font-medium text-text transition-colors hover:text-brand"
            >
              Sign in
            </Link>{" "}
            to save bookmarks — your Watching, Planning, and Completed lists stay on
            your account.
          </p>
        </TipBox>
      )}
    </div>
  );
}
