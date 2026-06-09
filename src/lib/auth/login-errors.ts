import type { AuthError } from "@supabase/supabase-js";

/** Query param values for `/login?error=…` */
export type LoginErrorCode =
  | "link_used"
  | "google"
  | "email"
  | "auth";

const MESSAGES: Record<LoginErrorCode, string> = {
  link_used:
    "This sign-in link has already been used or has expired. If you're not signed in, request a new magic link below.",
  google: "Google sign-in didn't complete. Please try again.",
  email: "Couldn't send a magic link. Check your email address and try again.",
  auth: "Something went wrong during sign-in. Please try again.",
};

export function loginErrorMessage(code: string | string[] | undefined): string | null {
  if (!code || Array.isArray(code)) return null;
  if (code in MESSAGES) return MESSAGES[code as LoginErrorCode];
  return MESSAGES.auth;
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
