import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { getCurrentUser } from "@/lib/supabase/user";

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
  const user = await getCurrentUser();

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

      <section className="space-y-3 rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Export bookmarks</h2>
        <p className="text-sm text-text-muted">
          Download all your bookmarks with their status and last-updated date.
          CSV opens in Excel or Google Sheets; JSON is for importing elsewhere.
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Plain links (not <Link>): these are file downloads, not pages. */}
          <a
            href="/settings/export?format=csv"
            download
            className="inline-flex items-center rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text transition-colors hover:border-brand"
          >
            Download CSV
          </a>
          <a
            href="/settings/export?format=json"
            download
            className="inline-flex items-center rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text transition-colors hover:border-brand"
          >
            Download JSON
          </a>
        </div>
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
