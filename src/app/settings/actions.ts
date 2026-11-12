"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount(formData: FormData) {
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") {
    redirect("/settings?error=confirm");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/settings");

  let failed = false;
  try {
    const { error } = await getSupabaseAdmin().auth.admin.deleteUser(user.id);
    if (error) {
      console.error("[settings] deleteUser failed:", error.message);
      failed = true;
    }
  } catch (err) {
    console.error("[settings] deleteUser failed:", err instanceof Error ? err.message : err);
    failed = true;
  }
  if (failed) redirect("/settings?error=delete");

  // The user no longer exists, so only clear the local session cookies
  // (a global sign-out would call Auth with a token for a deleted user).
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/");
}
