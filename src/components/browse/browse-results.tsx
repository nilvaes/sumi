"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MediaGrid, MediaGridSkeleton } from "@/components/media-grid";
import {
  browseQueryKey,
  filtersToSearchParams,
  type BrowseFilters,
} from "@/lib/anilist/filters";
import type { BrowseQuery } from "@/lib/anilist/gql/graphql";

type BrowsePage = NonNullable<BrowseQuery["Page"]>;

async function fetchPage(
  filters: BrowseFilters,
  page: number,
): Promise<BrowsePage> {
  const sp = filtersToSearchParams(filters);
  sp.set("page", String(page));
  const res = await fetch(`/api/browse?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to load results");
  return res.json();
}

export function BrowseResults({
  filters,
  initialPage,
}: {
  filters: BrowseFilters;
  initialPage: BrowsePage | null | undefined;
}) {
  const query = useInfiniteQuery({
    queryKey: ["browse", browseQueryKey(filters)],
    queryFn: ({ pageParam }) => fetchPage(filters, pageParam),
    initialPageParam: 1,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
    getNextPageParam: (last) =>
      last.pageInfo?.hasNextPage
        ? (last.pageInfo.currentPage ?? 1) + 1
        : undefined,
  });

  // Only skeleton when there is no data yet (e.g. client nav edge case).
  if (query.isPending) return <MediaGridSkeleton count={24} />;

  if (query.isError) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        Couldn&apos;t load results — AniList may be temporarily unavailable.
        Please try again in a few minutes.
      </p>
    );
  }

  const media = query.data.pages.flatMap((p) => p.media ?? []);

  return (
    <div className="space-y-8">
      <MediaGrid items={media} />
      {query.hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
