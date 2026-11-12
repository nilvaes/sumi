import { cache } from "react";
import { notFound } from "next/navigation";
import { getAnimeDetail } from "./api";

/** Deduped per request (page + generateMetadata share one AniList call). */
export const loadAnime = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const { Media } = await getAnimeDetail(id);
  // Adult titles are excluded everywhere else; don't serve them by direct URL either.
  if (!Media || Media.isAdult) notFound();
  return Media;
});
