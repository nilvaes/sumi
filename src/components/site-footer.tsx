import Link from "next/link";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/schedule", label: "Schedule" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
        >
          <span className="font-serif text-xl tracking-tight text-text">Sumi</span>
          <span className="font-jp text-xl leading-none text-text-muted">墨</span>
        </Link>

        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-x-6 gap-y-1"
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-text-muted sm:text-right">
          © {year} Sumi
          <span className="mx-1.5 text-border">·</span>
          <Link href="/about" className="transition-colors hover:text-text">
            Credits
          </Link>
        </p>
      </div>
    </footer>
  );
}
