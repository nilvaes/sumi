import Image from "next/image";
import Link from "next/link";
import type { MediaCardFieldsFragment } from "@/lib/anilist/gql/graphql";

export function AnimeCard({ media }: { media: MediaCardFieldsFragment }) {
  const title = media.title?.english ?? media.title?.romaji ?? "Untitled";
  const cover = media.coverImage?.large;
  const score = media.averageScore;

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
        {typeof score === "number" && (
          <span className="absolute right-1.5 top-1.5 rounded bg-bg/80 px-1.5 py-0.5 text-xs font-medium text-text">
            {score}%
          </span>
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
