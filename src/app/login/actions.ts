"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/app-origin";
import { classifyEmailSendFailure } from "@/lib/auth/login-errors";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const redirectTo = getAuthCallbackUrl(await headers());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) redirect("/login?error=google");
  if (data.url) redirect(data.url);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=email");

  const h = await headers();
  const supabase = await createClient();
  const emailRedirectTo = getAuthCallbackUrl(h);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("[auth] signInWithOtp failed:", error.message, {
      code: error.code,
      emailRedirectTo,
    });
    redirect(`/login?error=${classifyEmailSendFailure(error)}`);
  }
  redirect("/login?sent=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
