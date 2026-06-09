import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sumi is a warm, dark, editorial anime discovery app built with Next.js, TypeScript, AniList, and Supabase.",
};

const STACK: { label: string; value: string }[] = [
  { label: "Framework", value: "Next.js (App Router) + TypeScript" },
  { label: "Styling", value: "Tailwind CSS v4 — warm-dark editorial theme" },
  { label: "Data", value: "AniList GraphQL API (typed via graphql-codegen)" },
  { label: "Search", value: "Supabase Postgres + pg_trgm trigram index" },
  { label: "Client state", value: "TanStack Query (search + infinite browse)" },
  { label: "Hosting", value: "Vercel" },
];

const REPO_URL = "https://github.com/nilvaes/sumi";

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-brand transition-colors hover:text-brand-hover"
    >
      {children}
    </a>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 py-12">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl text-text">
          About Sumi <span className="font-jp text-2xl text-text-muted">墨</span>
        </h1>
        <p className="leading-relaxed text-text/90">
          Sumi (Japanese for <em>ink</em>) is a calm, editorial way to discover
          anime — browse what&apos;s airing, see what&apos;s trending, search the
          full catalog, and check the week&apos;s schedule. It&apos;s a portfolio
          and learning project, built to feel like a film/editorial site rather
          than a generic dashboard.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-text">How it works</h2>
        <p className="leading-relaxed text-text/90">
          Browse and detail pages read live from the AniList GraphQL API through a
          single server-side client that handles rate limiting (request spacing +
          429 backoff) and caches responses, so AniList is never called from the
          browser. Search is different: because AniList only matches whole words,
          titles are indexed in Supabase Postgres with a trigram index for fast
          partial and fuzzy matching. The index is populated from an
          openly-licensed dataset (refreshed manually when needed), plus a weekly
          top-up of missing recent titles from AniList (bounded — not a bulk
          catalog mirror). If search
          still misses a title, hybrid search queries AniList live.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-text">Performance notes</h2>
        <p className="leading-relaxed text-text/90">
          Sumi runs on Vercel&apos;s serverless platform. After a period of no
          traffic, the first request can hit a <em>cold start</em> — the
          function spins up and fetches fresh AniList data, so that initial load
          may take a second or two. Once warm, navigation is fast: pages stream a
          skeleton immediately, links are prefetched on hover, and AniList
          responses are cached, so repeat visits feel instant.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-text">Stack</h2>
        <dl className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {STACK.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 bg-surface/40 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <dt className="w-32 shrink-0 text-sm text-text-muted">
                {row.label}
              </dt>
              <dd className="text-sm text-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-text">Credits</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-text/90">
          <li>
            Anime data from{" "}
            <ExternalLink href="https://anilist.co">AniList</ExternalLink>. Sumi
            is an unofficial, non-commercial project and isn&apos;t affiliated
            with AniList.
          </li>
          <li>
            Search index built from{" "}
            <ExternalLink href="https://github.com/manami-project/anime-offline-database">
              anime-offline-database
            </ExternalLink>{" "}
            (Open Database License, ODbL 1.0).
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-text">Source</h2>
        <p className="text-sm leading-relaxed text-text/90">
          The code is on{" "}
          <ExternalLink href={REPO_URL}>GitHub</ExternalLink>. Tracking, a richer
          calendar, and stats are planned for later phases.
        </p>
      </section>

      <div>
        <Link
          href="/browse"
          className="inline-block rounded-md border border-border bg-surface px-5 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
        >
          Start browsing
        </Link>
      </div>
    </div>
  );
}
