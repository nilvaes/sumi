import "server-only";

import { cache } from "react";
import { createClient } from "./server";

/**
 * The signed-in user for this request, verified with Supabase Auth.
 *
 * Wrapped in React `cache` so the layout (BookmarksShell), the nav (UserNav) and
 * the page share one Auth call per render instead of each making their own —
 * fewer round trips and fewer concurrent token refreshes (which show up in the
 * Supabase auth logs as "refresh token already used").
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
