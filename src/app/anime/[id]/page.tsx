import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnimeDetail } from "@/lib/anilist/api";
import { RelationCard } from "@/components/relation-card";
import {
  formatCountdown,
  formatLabel,
  formatRelation,
  formatScore,
  statusLabel,
  stripHtml,
} from "@/lib/utils/format";
import { formatSeason } from "@/lib/utils/season";

type Params = { params: Promise<{ id: string }> };

async function loadAnime(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  const { Media } = await getAnimeDetail(id);
  if (!Media) notFound();
  return Media;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const media = await loadAnime(id);
  const title = media.title?.english ?? media.title?.romaji ?? "Anime";
  return {
    title,
    description: stripHtml(media.description).slice(0, 160) || undefined,
  };
}

export default async function AnimeDetailPage({ params }: Params) {
  const { id } = await params;
  const media = await loadAnime(id);

  const title = media.title?.english ?? media.title?.romaji ?? "Untitled";
  const romaji =
    media.title?.romaji && media.title.romaji !== title
      ? media.title.romaji
      : null;
  const score = formatScore(media.averageScore);
  const cover = media.coverImage?.extraLarge;
  const description = stripHtml(media.description);
  const studios = media.studios?.nodes?.filter((s) => s) ?? [];
  const relations = media.relations?.edges?.filter((e) => e?.node) ?? [];
  const youtubeId =
    media.trailer?.site === "youtube" ? media.trailer.id : null;

  const meta = [
    formatLabel(media.format),
    statusLabel(media.status),
    media.episodes ? `${media.episodes} eps` : null,
    media.duration ? `${media.duration} min` : null,
    media.season && media.seasonYear
      ? `${formatSeason(media.season)} ${media.seasonYear}`
      : null,
  ].filter(Boolean);

  return (
    <article>
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-80">
        {media.bannerImage ? (
          <Image
            src={media.bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="-mt-24 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-10">
          {/* Cover + side column */}
          <div className="space-y-4">
            <div className="relative mx-auto aspect-2/3 w-40 overflow-hidden rounded-md border border-border bg-surface shadow-lg md:mx-0 md:w-full">
              {cover ? (
                <Image
                  src={cover}
                  alt={title}
                  fill
                  priority
                  sizes="220px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-jp text-4xl text-text-muted">
                  墨
                </div>
              )}
            </div>

            {media.nextAiringEpisode && (
              <div className="rounded-md border border-border bg-surface p-3 text-sm">
                <p className="text-text-muted">Next episode</p>
                <p className="text-text">
                  Ep {media.nextAiringEpisode.episode} in{" "}
                  {formatCountdown(media.nextAiringEpisode.timeUntilAiring)}
                </p>
              </div>
            )}

            {media.externalLinks && media.externalLinks.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-text-muted">Links</h2>
                <ul className="flex flex-wrap gap-2">
                  {media.externalLinks.map(
                    (link) =>
                      link && (
                        <li key={link.id}>
                          <a
                            href={link.url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded border border-border bg-surface px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-accent hover:text-text"
                          >
                            {link.site}
                          </a>
                        </li>
                      ),
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Main column */}
          <div className="space-y-6 md:pt-24">
            <header className="space-y-1.5">
              <h1 className="font-serif text-3xl leading-tight text-text sm:text-4xl">
                {title}
              </h1>
              {romaji && <p className="text-text-muted">{romaji}</p>}
              {media.title?.native && (
                <p className="font-jp text-sm text-text-muted">
                  {media.title.native}
                </p>
              )}
            </header>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              {score && (
                <span className="font-medium text-accent">★ {score}</span>
              )}
              {meta.map((item, i) => (
                <span key={i} className="flex items-center gap-3">
                  {(i > 0 || score) && (
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                  )}
                  {item}
                </span>
              ))}
            </div>

            {media.genres && media.genres.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {media.genres.map(
                  (genre) =>
                    genre && (
                      <li
                        key={genre}
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
                      >
                        {genre}
                      </li>
                    ),
                )}
              </ul>
            )}

            {description && (
              <p className="max-w-prose whitespace-pre-line leading-relaxed text-text/90">
                {description}
              </p>
            )}

            {studios.length > 0 && (
              <p className="text-sm text-text-muted">
                <span className="text-text">Studio:</span>{" "}
                {studios.map((s) => s!.name).join(", ")}
              </p>
            )}

            {youtubeId && (
              <div className="space-y-2">
                <h2 className="font-serif text-xl text-text">Trailer</h2>
                <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-md border border-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={`${title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}

            {relations.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl text-text">Relations</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {relations.map((edge) => {
                    const node = edge!.node!;
                    return (
                      <RelationCard
                        key={`${node.id}-${edge!.relationType}`}
                        id={node.id}
                        label={formatRelation(edge!.relationType)}
                        title={node.title?.romaji ?? "Untitled"}
                        cover={node.coverImage?.large}
                        isAnime={node.type === "ANIME"}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            ← Back to browse
          </Link>
        </div>
      </div>
    </article>
  );
}
