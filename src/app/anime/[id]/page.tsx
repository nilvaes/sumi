import { Suspense } from "react";
import type { Metadata } from "next";
import { AnimeDetailContent } from "@/components/anime/anime-detail-content";
import { AnimeDetailSkeleton } from "@/components/anime/anime-detail-skeleton";

type Params = { params: Promise<{ id: string }> };

/** No AniList fetch here — async metadata can block client nav before loading.tsx shows. */
export async function generateMetadata(): Promise<Metadata> {
  return { title: "Anime" };
}

export default async function AnimeDetailPage({ params }: Params) {
  const { id } = await params;

  return (
    <Suspense fallback={<AnimeDetailSkeleton />}>
      <AnimeDetailContent id={id} />
    </Suspense>
  );
}
