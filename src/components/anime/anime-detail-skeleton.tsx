/** Placeholder layout while anime detail data loads (navigation + Suspense). */
export function AnimeDetailSkeleton() {
  return (
    <article aria-busy="true" aria-label="Loading anime">
      <div className="h-48 w-full animate-pulse bg-surface sm:h-64 md:h-80" />

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="-mt-24 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-10">
          <div className="space-y-4">
            <div className="relative mx-auto aspect-2/3 w-40 animate-pulse rounded-md bg-surface md:mx-0 md:w-full" />
            <div className="h-16 animate-pulse rounded-md bg-surface" />
          </div>

          <div className="space-y-6 md:pt-24">
            <div className="space-y-2">
              <div className="h-9 w-4/5 max-w-md animate-pulse rounded bg-surface sm:h-10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
            </div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 w-16 animate-pulse rounded-full bg-surface"
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface" />
              <div className="h-4 w-full animate-pulse rounded bg-surface" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
