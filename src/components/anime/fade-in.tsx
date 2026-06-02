"use client";

import { cn } from "@/lib/utils";

export const DETAIL_FADE_MS = 300;

/** Subtle mount fade for text blocks (images use synced reveal separately). */
export function FadeIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in fill-mode-both ease-out motion-reduce:animate-none",
        className,
      )}
      style={{ animationDuration: `${DETAIL_FADE_MS}ms` }}
    >
      {children}
    </div>
  );
}
