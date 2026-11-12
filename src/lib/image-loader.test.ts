import { describe, expect, it } from "vitest";
import imageLoader from "./image-loader";

const cover = (size: string) =>
  `https://s4.anilist.co/file/anilistcdn/media/anime/cover/${size}/bx154587-n1fmjRv4JQUd.jpg`;

describe("imageLoader", () => {
  it("picks the smallest AniList cover that covers the requested width", () => {
    expect(imageLoader({ src: cover("large"), width: 48 })).toBe(cover("small"));
    expect(imageLoader({ src: cover("large"), width: 128 })).toBe(cover("small"));
    expect(imageLoader({ src: cover("large"), width: 256 })).toBe(cover("medium"));
    expect(imageLoader({ src: cover("medium"), width: 384 })).toBe(cover("large"));
    expect(imageLoader({ src: cover("small"), width: 1080 })).toBe(cover("large"));
  });

  it("leaves other images untouched", () => {
    const banner = "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg";
    const mal = "https://cdn.myanimelist.net/images/anime/1015/138006.jpg";
    expect(imageLoader({ src: banner, width: 640 })).toBe(banner);
    expect(imageLoader({ src: mal, width: 256 })).toBe(mal);
  });
});
