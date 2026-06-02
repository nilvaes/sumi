import { AnimeCard } from "./anime-card";
import type { MediaCardFieldsFragment } from "@/lib/anilist/gql/graphql";

type MediaItem = MediaCardFieldsFragment | null;

export function MediaGrid({ items }: { items: readonly MediaItem[] }) {
  const media = items.filter((m): m is MediaCardFieldsFragment => m !== null);

  if (media.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        Nothing to show here yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {media.map((m) => (
        <AnimeCard key={m.id} media={m} />
      ))}
    </div>
  );
}

export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="aspect-2/3 animate-pulse rounded-md bg-surface" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-surface" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}
