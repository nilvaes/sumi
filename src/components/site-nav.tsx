import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/search", label: "Search" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl tracking-tight text-text">
            Sumi
          </span>
          <span className="font-jp text-sm text-text-muted">墨</span>
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
