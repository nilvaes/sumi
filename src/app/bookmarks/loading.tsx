import { MediaGridSkeleton } from "@/components/media-grid";

export default function BookmarksLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="space-y-2 pb-6">
        <div className="h-9 w-44 animate-pulse rounded bg-surface sm:h-10" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-surface" />
      </header>

      <div
        className="sticky top-14 z-40 ml-[calc(50%-50vw)] w-screen bg-bg py-3"
        aria-hidden
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-11 animate-pulse rounded-sm bg-surface" />
        </div>
      </div>

      <div className="pt-6">
        <MediaGridSkeleton count={12} />
      </div>
    </div>
  );
}
