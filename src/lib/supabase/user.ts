import "server-only";

import { cache } from "react";
import { createClient } from "./server";

export type CurrentUser = { id: string; email: string | null };

/**
 * The signed-in user for this request, for rendering (nav, bookmarks, settings).
 *
 * Uses `getClaims()`: the session's access token is verified against the
 * project's public signing key (cached for 10 minutes), so pages don't make an
 * Auth-server round trip on every view the way `getUser()` did. The token is
 * short-lived (1 hour) and refreshed by the proxy.
 *
 * Security-sensitive actions (account deletion, bookmark writes) still call
 * `getUser()` on the Auth server, and the database enforces Row Level Security
 * on every query regardless.
 *
 * Wrapped in React `cache` so the layout, nav and page share one check per render.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const { sub, email } = data.claims;
  return { id: sub, email: typeof email === "string" && email ? email : null };
});
