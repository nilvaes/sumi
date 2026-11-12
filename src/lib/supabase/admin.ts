import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only client using the service-role key. Bypasses RLS — use exclusively
 * for trusted operations (account deletion). Never import from client components.
 *
 * Created lazily so a missing key fails only the code path that needs it (with a
 * clear message) instead of crashing every module that imports this file.
 * `SUPABASE_SERVICE_ROLE_KEY` must be set in the Vercel runtime environment for
 * "Delete account" to work.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — required at runtime for account deletion.",
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
