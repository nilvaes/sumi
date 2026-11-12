function configuredSiteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * Resolve the public app origin for OAuth redirects (local, Vercel, custom domain).
 *
 * In production the configured `NEXT_PUBLIC_SITE_URL` always wins, so request
 * headers (`Origin`, `Host`, `X-Forwarded-Host`) can't steer where Supabase sends
 * the auth code. Preview/local builds fall back to the request host so preview
 * deployments keep working. Supabase's Redirect URL allowlist is the final check.
 */
export function getAppOriginFromHeaders(h: Headers): string {
  const site = configuredSiteUrl();
  if (site && process.env.VERCEL_ENV === "production") return site;

  const host = h.get("x-forwarded-host") ?? h.get("host");
  const hostname = host?.split(",")[0]?.trim();
  if (hostname && /^[a-z0-9.-]+(:\d+)?$/i.test(hostname)) {
    // Browsers send Origin on form posts; trust it only when it matches the host.
    const origin = h.get("origin");
    if (origin) {
      try {
        const o = new URL(origin);
        if (o.host === hostname) return o.origin;
      } catch {
        // ignore malformed Origin
      }
    }
    const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim();
    return `${proto === "http" ? "http" : "https"}://${hostname}`;
  }

  if (site) return site;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(h: Headers): string {
  return `${getAppOriginFromHeaders(h)}/auth/callback`;
}
