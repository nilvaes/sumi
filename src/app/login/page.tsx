import type { Metadata } from "next";
import Link from "next/link";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { signInWithEmail, signInWithGoogle } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Sumi with Google or email.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function flag(params: Record<string, string | string[] | undefined>, key: string) {
  const v = params[key];
  return v === "1" || v === "true";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sent = flag(sp, "sent");
  const errorMessage = loginErrorMessage(sp.error);

  return (
    <div className="mx-auto max-w-sm space-y-8 px-4 py-16">
      <header className="space-y-2 text-center">
        <h1 className="font-serif text-3xl text-text">Sign in</h1>
        <p className="text-sm text-text-muted">
          Save your watchlists and pick up where you left off.
        </p>
      </header>

      {sent && (
        <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text">
          Check your email for a sign-in link. It may take a minute to arrive.
        </p>
      )}

      {errorMessage && (
        <p className="rounded-md border border-brand/40 bg-surface px-4 py-3 text-sm text-text-muted">
          {errorMessage}
        </p>
      )}

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          Continue with Google
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-border" />
          or email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form action={signInWithEmail} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm text-text-muted">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-brand focus:ring-1"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Send magic link
          </button>
        </form>
      </div>

      <footer className="space-y-4">
        <p className="text-center text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text">
            ← Back to home
          </Link>
        </p>
        <p className="rounded-md border border-brand/15 bg-brand/5 px-4 py-3 text-center text-xs leading-relaxed text-text-muted">
          First time here? We&apos;ll create your account when you sign in.
        </p>
      </footer>
    </div>
  );
}
