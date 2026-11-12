import type { NextConfig } from "next";

/*
  Baseline security headers. No script/style CSP here: Next.js injects inline
  scripts, and a nonce-based CSP would force every page to render dynamically.
  These directives are safe with that setup and block clickjacking, plugin
  content, <base> hijacking and MIME sniffing.
*/
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Covers are resized by picking one of AniList's own stored sizes (see the
    // loader) — no image-optimization service involved. Banners only exist in
    // one size and use `unoptimized`.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
