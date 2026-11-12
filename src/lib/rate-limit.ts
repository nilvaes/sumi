/**
 * Small fixed-window rate limiter kept in server memory.
 *
 * On serverless each instance has its own counters, so this is a best-effort
 * guard against a single client hammering one warm instance (and, through it,
 * AniList) — not a global quota. For hard limits add a Vercel Firewall rate-limit
 * rule or a shared store (e.g. Upstash Redis).
 */
type Bucket = { count: number; resetAt: number };

const MAX_KEYS = 5_000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now = Date.now()) {
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      if (buckets.size >= MAX_KEYS) {
        for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
        if (buckets.size >= MAX_KEYS) buckets.clear();
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count++;
    const ok = bucket.count <= limit;
    return {
      ok,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSec: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
    };
  };
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
