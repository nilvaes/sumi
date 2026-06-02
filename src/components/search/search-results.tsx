"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MediaGrid, MediaGridSkeleton } from "@/components/media-grid";
import type { CardMedia } from "@/components/anime-card";
import type { SearchAnime } from "@/lib/supabase/search";

type SearchPage = { results: SearchAnime[]; hasNextPage: boolean };

async function fetchPage(q: string, page: number): Promise<SearchPage> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(q)}&page=${page}`,
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

function toCard(r: SearchAnime): CardMedia {
  return {
    id: r.anilist_id,
    title: { romaji: r.title_romaji, english: r.title_english },
    coverImage: { large: r.cover_image, color: r.cover_color },
    format: r.format,
    seasonYear: r.season_year,
  };
}

export function SearchResults({ q }: { q: string }) {
  const query = useInfiniteQuery({
    queryKey: ["search", q],
    queryFn: ({ pageParam }) => fetchPage(q, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.hasNextPage ? pages.length + 1 : undefined,
    enabled: q.length >= 2,
  });

  if (q.length < 2) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        Type at least two characters to search.
      </p>
    );
  }

  if (query.isPending) return <MediaGridSkeleton count={18} />;

  if (query.isError) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        Couldn&apos;t load results. Please try again.
      </p>
    );
  }

  const items = query.data.pages.flatMap((p) => p.results.map(toCard));

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        No anime found for that search.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <MediaGrid items={items} unoptimized />
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
