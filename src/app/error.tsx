"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-24 text-center">
      <h1 className="font-serif text-2xl text-text">Something went wrong</h1>
      <p className="text-sm leading-relaxed text-text-muted">
        This page couldn&apos;t load. If AniList is down, browse and schedule
        may be affected — search often still works.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border bg-surface px-4 py-2 text-text transition-colors hover:bg-surface-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-brand transition-colors hover:text-brand-hover"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="text-text-muted transition-colors hover:text-text"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
