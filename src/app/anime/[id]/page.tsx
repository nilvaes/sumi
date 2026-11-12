import { Suspense } from "react";
import type { Metadata } from "next";
import { AnimeDetailContent } from "@/components/anime/anime-detail-content";
import { AnimeDetailSkeleton } from "@/components/anime/anime-detail-skeleton";
import { AniListError } from "@/lib/anilist/client";
import { loadAnime } from "@/lib/anilist/load-anime";
import { stripHtml } from "@/lib/utils/format";

type Params = { params: Promise<{ id: string }> };

const DESCRIPTION_MAX = 160;

/**
 * Real title + description for tabs, search results and link previews.
 *
 * Since Next 15.2 metadata is streamed: browsers get the page (and loading.tsx)
 * without waiting for this, so it no longer blocks client navigation. Only
 * HTML-limited bots (Discord, Facebook, …) wait, which is what we want so their
 * previews include the title. `loadAnime` is React-cached and backed by the
 * AniList data cache, so this shares one fetch with the page body.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;

  let media: Awaited<ReturnType<typeof loadAnime>>;
  try {
    media = await loadAnime(id);
  } catch (err) {
    // notFound() from loadAnime must propagate; AniList outages get a generic title.
    if (err instanceof AniListError) return { title: "Anime" };
    throw err;
  }

  const title = media.title?.english ?? media.title?.romaji ?? "Untitled";
  const description = summarize(stripHtml(media.description));

  return {
    title,
    description,
    alternates: { canonical: `/anime/${media.id}` },
    openGraph: {
      type: "website",
      url: `/anime/${media.id}`,
      title: `${title} · Sumi`,
      description,
      siteName: "Sumi",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Sumi`,
      description,
    },
  };
}

/** One-line summary capped at DESCRIPTION_MAX, cut on a word boundary. */
function summarize(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return undefined;
  if (flat.length <= DESCRIPTION_MAX) return flat;
  const cut = flat.slice(0, DESCRIPTION_MAX - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > 100 ? cut.slice(0, space) : cut}…`;
}

export default async function AnimeDetailPage({ params }: Params) {
  const { id } = await params;

  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent id={id} />
    </Suspense>
  );
}
