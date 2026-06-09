import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { classifyAuthFailure } from "@/lib/auth/login-errors";
import { createClient } from "@/lib/supabase/server";

/** OAuth (Google) and email magic-link return here with `?code=` or `?token_hash=`. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  // Supabase may redirect with error params when the link is invalid or reused.
  if (searchParams.get("error") || searchParams.get("error_code")) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const code = classifyAuthFailure(searchParams);
    return NextResponse.redirect(`${origin}/login?error=${code}`);
  }

  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && otpType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const code = classifyAuthFailure(searchParams, error);
    return NextResponse.redirect(`${origin}/login?error=${code}`);
  }

  const authCode = searchParams.get("code");
  if (authCode) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Second click on a magic link: first click may already have signed them in.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const code = classifyAuthFailure(searchParams, error);
    return NextResponse.redirect(`${origin}/login?error=${code}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
