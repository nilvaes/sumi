import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3">
          <span>
            <span className="font-serif text-base text-text">Sumi</span> — Anime
            Tracking and More
          </span>
          <Link
            href="/about"
            className="text-text-muted transition-colors hover:text-text"
          >
            About
          </Link>
        </p>
        <p>
          Data from{" "}
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:text-brand-hover"
          >
            AniList
          </a>
          {" · "}
          search index from{" "}
          <a
            href="https://github.com/manami-project/anime-offline-database"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:text-brand-hover"
          >
            anime-offline-database
          </a>{" "}
          (ODbL)
        </p>
      </div>
    </footer>
  );
}
