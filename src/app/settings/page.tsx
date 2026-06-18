import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your Sumi account settings.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function settingsErrorMessage(code: string | string[] | undefined): string | null {
  if (!code || Array.isArray(code)) return null;
  if (code === "confirm") {
    return "Confirmation did not match. Type DELETE exactly to delete your account.";
  }
  if (code === "delete") {
    return "Could not delete your account. Please try again or contact support via GitHub.";
  }
  return null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/settings");

  const sp = await searchParams;
  const errorMessage = settingsErrorMessage(sp.error);
  const email = user.email;

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-text">Settings</h1>
        <p className="text-sm text-text-muted">Manage your Sumi account.</p>
      </header>

      {errorMessage && (
        <p className="rounded-md border border-brand/40 bg-surface px-4 py-3 text-sm text-text-muted">
          {errorMessage}
        </p>
      )}

      <section className="space-y-3 rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Account</h2>
        {email ? (
          <p className="text-sm text-text-muted">
            Signed in as <span className="text-text">{email}</span>
          </p>
        ) : (
          <p className="text-sm text-text-muted">Signed in with Google.</p>
        )}
      </section>

      <section className="space-y-3 rounded-md border border-brand/30 bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Delete account</h2>
        <DeleteAccountForm />
      </section>

      <p className="text-center text-xs text-text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
