import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Default is [75]; cards/hero use quality={90}.
    qualities: [75, 90],
    remotePatterns: [
      // Optimized images we control: AniList covers/banners and YouTube thumbs.
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      // Search results come from the anime-offline-database, which aggregates
      // cover art from many CDNs (MAL, anime-planet, kitsu, livechart, …). These
      // are rendered with `unoptimized`, so they're served directly rather than
      // through the image optimizer.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
