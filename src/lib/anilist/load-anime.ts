import { cache } from "react";
import { notFound } from "next/navigation";
import { getAnimeDetail } from "./api";

/** Deduped per request (page + generateMetadata share one AniList call). */
export const loadAnime = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  const { Media } = await getAnimeDetail(id);
  if (!Media) notFound();
  return Media;
});
