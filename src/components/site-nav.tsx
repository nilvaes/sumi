import Link from "next/link";
import { SearchBox } from "./search-box";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl tracking-tight text-text">
            Sumi
          </span>
          <span className="hidden font-jp text-sm text-text-muted sm:inline">
            墨
          </span>
        </Link>

        <div className="flex flex-1 justify-center">
          <SearchBox />
        </div>

        <Link
          href="/browse"
          className="shrink-0 text-sm text-text-muted transition-colors hover:text-text"
        >
          Browse
        </Link>
      </nav>
    </header>
  );
}
