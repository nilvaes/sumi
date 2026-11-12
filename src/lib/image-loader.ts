"use client";

/*
  next/image loader (configured globally via `images.loaderFile` in next.config).

  AniList's CDN already serves every cover in three sizes, so instead of running
  images through an optimization service we pick the smallest stored size that
  covers the width the browser asks for:

    cover/small/   ~100px wide  (AniList "medium")
    cover/medium/  ~230px wide  (AniList "large")
    cover/large/   ~460px wide  (AniList "extraLarge")

  A grid card on a regular screen gets the 230px file (~1/3 the bytes of the
  460px one); phones and high-density screens still get the sharp 460px file.
  Anything that isn't an AniList cover (banners, other hosts) is returned as-is.
  Images rendered with `unoptimized` bypass this loader entirely.
*/

const ANILIST_COVER = /^(https:\/\/s4\.anilist\.co\/file\/anilistcdn\/media\/anime\/cover\/)(small|medium|large)(\/.+)$/;

/** Slight upscaling (100→128, 230→256) is invisible at these sizes. */
export function anilistCoverSize(width: number): "small" | "medium" | "large" {
  if (width <= 128) return "small";
  if (width <= 256) return "medium";
  return "large";
}

export default function imageLoader({ src, width }: { src: string; width: number }) {
  const m = src.match(ANILIST_COVER);
  if (!m) return src;
  return `${m[1]}${anilistCoverSize(width)}${m[3]}`;
}
