import Image from "next/image";
import Link from "next/link";
import type { ScheduleEntry } from "@/lib/anilist/api";
import { formatCountdown, formatLabel } from "@/lib/utils/format";

function timeLabel(airingAt: number): string {
  return new Date(airingAt * 1000).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ScheduleEpisodeCard({
  entry,
  nowMs,
}: {
  entry: ScheduleEntry;
  nowMs: number;
}) {
  const title =
    entry.media.title?.english ?? entry.media.title?.romaji ?? "Untitled";
  const cover =
    entry.media.coverImage?.extraLarge ?? entry.media.coverImage?.large;
  const secondsUntil = entry.airingAt - Math.floor(nowMs / 1000);
  const aired = secondsUntil <= 0;

  return (
    <Link
      href={`/anime/${entry.media.id}`}
      prefetch
      className="group flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-md border border-border bg-surface">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            quality={90}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-jp text-3xl text-text-muted">
            墨
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 space-y-0.5 bg-bg/90 px-2 py-1.5 text-xs backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 text-text">
            <time dateTime={new Date(entry.airingAt * 1000).toISOString()}>
              {timeLabel(entry.airingAt)}
            </time>
            <span className="font-medium">Ep {entry.episode}</span>
          </div>
          <p className="flex items-center gap-1.5 text-text-muted">
            {aired ? (
              "Aired"
            ) : (
              <>
                <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                {formatCountdown(secondsUntil)}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="line-clamp-2 text-sm leading-snug text-text transition-colors group-hover:text-brand">
          {title}
        </h3>
        {entry.media.format && (
          <p className="text-xs text-text-muted">
            {formatLabel(entry.media.format)}
          </p>
        )}
      </div>
    </Link>
  );
}
