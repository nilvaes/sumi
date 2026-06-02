import { MediaGridSkeleton } from "@/components/media-grid";

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="h-9 w-40 animate-pulse rounded bg-surface sm:h-10" />
      <div className="h-24 animate-pulse rounded-md bg-surface" />
      <MediaGridSkeleton count={24} />
    </div>
  );
}
