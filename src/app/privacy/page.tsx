import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Sumi handles your account data and sign-in information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-12">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl text-text">Privacy</h1>
        <p className="text-sm text-text-muted">Last updated: June 2026</p>
        <p className="leading-relaxed text-text/90">
          Sumi is a personal portfolio project. This page explains what data is
          collected when you sign in and save bookmarks.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-text">What we collect</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-text/90">
          <li>
            <strong className="font-medium text-text">Sign-in:</strong> If you
            use Google, we receive basic profile info (such as your name and
            email) through Supabase. If you use a magic link, we store your
            email address to send the link.
          </li>
          <li>
            <strong className="font-medium text-text">Bookmarks:</strong> Anime
            you save (title id and list status: Watching, Planning, or
            Completed), linked to your account.
          </li>
          <li>
            <strong className="font-medium text-text">Browsing:</strong> Public
            pages (home, browse, search) do not require an account. We do not
            sell your data.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-text">How we use it</h2>
        <p className="text-sm leading-relaxed text-text/90">
          Account data is used only to sign you in and keep your bookmarks
          across devices. We do not use it for advertising or marketing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-text">Third-party services</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-text/90">
          <li>
            <strong className="font-medium text-text">Supabase</strong> —
            authentication and bookmark storage.
          </li>
          <li>
            <strong className="font-medium text-text">Google</strong> — optional
            sign-in (subject to{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:text-brand-hover"
            >
              Google&apos;s privacy policy
            </a>
            ).
          </li>
          <li>
            <strong className="font-medium text-text">Vercel</strong> — hosting.
          </li>
          <li>
            <strong className="font-medium text-text">AniList</strong> — public
            anime metadata only; not your account data.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-text">Retention &amp; deletion</h2>
        <p className="text-sm leading-relaxed text-text/90">
          Data is kept while your account exists. You can delete your account
          anytime in{" "}
          <Link href="/settings" className="text-brand hover:text-brand-hover">
            Settings
          </Link>
          . This removes your sign-in and all bookmarks permanently.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-text">Changes</h2>
        <p className="text-sm leading-relaxed text-text/90">
          This policy may be updated as the app evolves. Material changes will
          be reflected on this page.
        </p>
      </section>

      <p className="text-sm text-text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
