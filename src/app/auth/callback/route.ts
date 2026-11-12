import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyAuthFailure } from "@/lib/auth/login-errors";
import { NEXT_COOKIE, safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES = new Set<EmailOtpType>([
  "magiclink",
  "email",
  "signup",
  "invite",
  "recovery",
  "email_change",
]);

/** OAuth (Google) and email magic-link return here with `?code=` or `?token_hash=`. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = await cookies();

  // Destination comes from `?next=` or the cookie set by the login action, and is
  // always reduced to a same-origin path (prevents open redirects like `?next=@evil.com`).
  const next = safeNextPath(
    searchParams.get("next") ?? cookieStore.get(NEXT_COOKIE)?.value,
  );

  const redirectTo = (path: string) => {
    cookieStore.delete(NEXT_COOKIE);
    return NextResponse.redirect(new URL(path, origin));
  };

  // Supabase may redirect with error params when the link is invalid or reused.
  if (searchParams.get("error") || searchParams.get("error_code")) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return redirectTo(next);
    return redirectTo(`/login?error=${classifyAuthFailure(searchParams)}`);
  }

  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type") as EmailOtpType | null;
  const otpType = rawType && OTP_TYPES.has(rawType) ? rawType : null;
  if (tokenHash && otpType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (!error) return redirectTo(next);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return redirectTo(next);

    return redirectTo(`/login?error=${classifyAuthFailure(searchParams, error)}`);
  }

  const authCode = searchParams.get("code");
  if (authCode) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (!error) return redirectTo(next);

    // Second click on a magic link: first click may already have signed them in.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return redirectTo(next);

    return redirectTo(`/login?error=${classifyAuthFailure(searchParams, error)}`);
  }

  return redirectTo("/login?error=auth");
}
