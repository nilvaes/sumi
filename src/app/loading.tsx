import { MediaGridSkeleton } from "@/components/media-grid";

function SectionSkeleton() {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <div className="h-8 w-36 animate-pulse rounded bg-surface" />
        <div className="h-4 w-16 animate-pulse rounded bg-surface" />
      </div>
      <MediaGridSkeleton count={6} />
    </section>
  );
}

export default function HomeLoading() {
  return (
    <>
      <div
        className="h-[min(52vh,440px)] w-full animate-pulse bg-surface sm:h-[min(56vh,500px)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    </>
  );
}
