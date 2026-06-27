import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AniList covers/banners use `unoptimized` — served from s4.anilist.co as-is.
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400, // 31 days — fewer re-transforms for repeat/crawler hits
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
    ],
  },
};

export default nextConfig;
