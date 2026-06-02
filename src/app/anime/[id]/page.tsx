import { Suspense } from "react";
import type { Metadata } from "next";
import { AnimeDetailContent } from "@/components/anime/anime-detail-content";
import { AnimeDetailSkeleton } from "@/components/anime/anime-detail-skeleton";
import { loadAnime } from "@/lib/anilist/load-anime";
import { stripHtml } from "@/lib/utils/format";

type Params = { params: Promise<{ id: string }> };

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

  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent id={id} />
    </Suspense>
  );
}
