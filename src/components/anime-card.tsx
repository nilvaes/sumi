import Image from "next/image";
import Link from "next/link";
import type { MediaCardFieldsFragment } from "@/lib/anilist/gql/graphql";
import { formatCountdown } from "@/lib/utils/format";

export function AnimeCard({ media }: { media: MediaCardFieldsFragment }) {
  const title = media.title?.english ?? media.title?.romaji ?? "Untitled";
  const cover = media.coverImage?.large;
  const next = media.nextAiringEpisode;

  return (
    <Link
      href={`/anime/${media.id}`}
      className="group flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-md border border-border bg-surface">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-jp text-3xl text-text-muted">
            墨
          </div>
        )}
        {next && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-bg/85 px-2 py-1 text-xs text-text backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-accent"
              />
              EP {next.episode}
            </span>
            <span className="text-text-muted">
              {formatCountdown(next.timeUntilAiring)}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className="line-clamp-2 text-sm leading-snug text-text transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="text-xs text-text-muted">
          {[media.format, media.seasonYear].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
