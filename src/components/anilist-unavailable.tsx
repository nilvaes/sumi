import Link from "next/link";

/** Shown when live AniList data cannot be loaded (outage, rate limit, etc.). */
export function AniListUnavailable({
  showSearchHint = true,
}: {
  showSearchHint?: boolean;
}) {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="text-sm text-text-muted">
        Live anime data is temporarily unavailable. AniList may be undergoing
        maintenance — please try again in a few minutes.
      </p>
      {showSearchHint && (
        <p className="text-xs text-text-muted">
          <Link href="/search" className="text-brand transition-colors hover:text-brand-hover">
            Search
          </Link>{" "}
          still works from our local catalog.
        </p>
      )}
    </div>
  );
}
