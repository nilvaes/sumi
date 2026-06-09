import type { AuthError } from "@supabase/supabase-js";

/** Query param values for `/login?error=…` */
export type LoginErrorCode =
  | "link_used"
  | "google"
  | "email"
  | "email_rate_limit"
  | "email_signup_disabled"
  | "email_redirect"
  | "email_captcha"
  | "auth";

const MESSAGES: Record<LoginErrorCode, string> = {
  link_used:
    "This sign-in link has already been used or has expired. If you're not signed in, request a new magic link below.",
  google: "Google sign-in didn't complete. Please try again.",
  email: "Couldn't send a magic link. Check your email address and try again.",
  email_rate_limit:
    "Too many magic-link requests. Wait a few minutes, then try again.",
  email_signup_disabled:
    "Email sign-in isn't enabled yet. In Supabase: Authentication → Providers → Email, and turn on new user sign-ups.",
  email_redirect:
    "Magic link redirect URL isn't allowed. In Supabase URL Configuration, add your site's /auth/callback URL to Redirect URLs (see docs/supabase-auth-setup.md).",
  email_captcha:
    "Email sign-in needs a CAPTCHA check. Disable CAPTCHA in Supabase (Auth → Bot and Abuse Protection) or add Turnstile/hCaptcha to the login form.",
  auth: "Something went wrong during sign-in. Please try again.",
};

export function loginErrorMessage(code: string | string[] | undefined): string | null {
  if (!code || Array.isArray(code)) return null;
  if (code in MESSAGES) return MESSAGES[code as LoginErrorCode];
  return MESSAGES.auth;
}

/** Map Supabase signInWithOtp failures to a login error code. */
export function classifyEmailSendFailure(error: AuthError): LoginErrorCode {
  const code = error.code?.toLowerCase() ?? "";
  const msg = error.message.toLowerCase();

  if (code === "over_email_send_rate_limit" || msg.includes("rate limit")) {
    return "email_rate_limit";
  }

  if (
    code === "signup_disabled" ||
    msg.includes("signups not allowed") ||
    msg.includes("signup is disabled")
  ) {
    return "email_signup_disabled";
  }

  if (
    msg.includes("redirect") ||
    msg.includes("invalid redirect") ||
    msg.includes("not allowed")
  ) {
    return "email_redirect";
  }

  if (msg.includes("captcha")) {
    return "email_captcha";
  }

  return "email";
}

/** Map Supabase callback query params or AuthError to a login error code. */
export function classifyAuthFailure(
  params: URLSearchParams,
  authError?: AuthError | null,
): LoginErrorCode {
  const urlCode = params.get("error_code") ?? params.get("error");
  const description = (params.get("error_description") ?? "").toLowerCase();

  if (
    urlCode === "otp_expired" ||
    description.includes("invalid or has expired") ||
    description.includes("already been used")
  ) {
    return "link_used";
  }

  if (authError) {
    const code = authError.code?.toLowerCase() ?? "";
    const msg = authError.message.toLowerCase();

    if (
      code === "otp_expired" ||
      msg.includes("invalid or has expired") ||
      msg.includes("already been used") ||
      msg.includes("code verifier") ||
      msg.includes("invalid flow state")
    ) {
      return "link_used";
    }
  }

  return "auth";
}
