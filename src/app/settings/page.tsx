import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your Sumi account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/settings");

  const email = user.email;

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-text">Settings</h1>
        <p className="text-sm text-text-muted">Manage your Sumi account.</p>
      </header>

      <section className="space-y-3 rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-medium text-text">Account</h2>
        {email ? (
          <p className="text-sm text-text-muted">
            Signed in as{" "}
            <span className="text-text">{email}</span>
          </p>
        ) : (
          <p className="text-sm text-text-muted">Signed in with Google.</p>
        )}
      </section>

      <p className="text-center text-xs text-text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
