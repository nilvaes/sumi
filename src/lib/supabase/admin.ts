import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-only client using the service-role key. Bypasses RLS — use exclusively
 * for trusted writes (the catalog sync). Never import from client components.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
