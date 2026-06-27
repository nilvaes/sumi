export default function ScheduleLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header className="space-y-2">
        <div className="h-9 w-56 animate-pulse rounded bg-surface sm:h-10" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface" />
      </header>

      <div className="space-y-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-surface" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex gap-4 rounded-md border border-border bg-surface/40 p-3"
                >
                  <div className="h-16 w-12 shrink-0 animate-pulse rounded bg-surface" />
                  <div className="flex flex-1 flex-col justify-center gap-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
