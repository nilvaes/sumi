import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AniList covers/banners use `unoptimized` — served from s4.anilist.co as-is.
    // These settings apply only to any remaining optimized images (e.g. YouTube).
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400, // 31 days — fewer re-transforms for repeat/crawler hits
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      // Search suggestions: arbitrary CDNs from anime-offline-database.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
