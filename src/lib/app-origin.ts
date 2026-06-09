/** Resolve the public app origin for OAuth redirects (local, Vercel, custom domain). */
export function getAppOriginFromHeaders(h: Headers): string {
  const origin = h.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() ?? "https";
    const hostname = host.split(",")[0]?.trim();
    if (hostname) return `${proto}://${hostname}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(h: Headers): string {
  return `${getAppOriginFromHeaders(h)}/auth/callback`;
}
