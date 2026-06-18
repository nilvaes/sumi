"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[settings] deleteUser failed:", error.message);
    redirect("/settings?error=delete");
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
