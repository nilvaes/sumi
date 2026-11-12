/** Cookie that carries the post-login destination through the OAuth / magic-link round trip. */
export const NEXT_COOKIE = "sumi_next";

const BASE = "http://sumi.invalid";

/**
 * Sanitize a user-supplied "return to" value into a same-origin path.
 *
 * Only relative paths that start with a single "/" are accepted. Anything that
 * could resolve to another host ("//evil.com", "/\\evil.com", "@evil.com",
 * ".evil.com", "https://evil.com", control characters) falls back to `/`.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (raw.length > 512) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  // Browsers strip tab/newline from URLs, which can turn "/\t/evil.com" into "//evil.com".
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;

  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    // Never bounce back into the auth flow itself.
    if (url.pathname.startsWith("/auth/") || url.pathname === "/login") return fallback;
    return path;
  } catch {
    return fallback;
  }
}
