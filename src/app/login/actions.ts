"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/app-origin";
import { classifyEmailSendFailure } from "@/lib/auth/login-errors";
import { NEXT_COOKIE, safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Remember where to send the user after the OAuth / magic-link round trip.
 * Kept in a short-lived cookie so the redirect URL sent to Supabase stays exactly
 * `/auth/callback` (matching the dashboard Redirect URL allowlist).
 */
async function rememberNext(formData: FormData) {
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const cookieStore = await cookies();
  if (next === "/") {
    cookieStore.delete(NEXT_COOKIE);
    return;
  }
  cookieStore.set(NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });
}

export async function signInWithGoogle(formData: FormData) {
  await rememberNext(formData);
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
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    redirect("/login?error=email");
  }

  await rememberNext(formData);
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
  revalidatePath("/", "layout");
  redirect("/");
}
