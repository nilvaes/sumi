export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-serif text-base text-text">Sumi</span> — Anime
          Tracking and More
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
        </p>
      </div>
    </footer>
  );
}
