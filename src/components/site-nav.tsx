import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { MobileNavMenu } from "@/components/site-nav-mobile-menu";
import { createClient } from "@/lib/supabase/server";
import { SearchBox } from "./search-box";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
      {/* Mobile: menu left · search center · brand right */}
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 md:hidden">
        <MobileNavMenu isLoggedIn={isLoggedIn} />
        <div className="min-w-0 flex-1">
          <SearchBox className="mx-auto max-w-none" />
        </div>
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="font-serif text-xl tracking-tight text-text">
            Sumi
          </span>
          <span className="font-jp text-xl leading-none text-text-muted">
            墨
          </span>
        </Link>
      </nav>

      {/* Desktop */}
      <nav className="mx-auto hidden max-w-6xl items-center gap-6 px-4 py-3 md:flex">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="font-serif text-2xl tracking-tight text-text">
            Sumi
          </span>
          <span className="font-jp text-2xl leading-none text-text-muted">
            墨
          </span>
        </Link>

        <div className="flex flex-1 justify-center">
          <SearchBox />
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <Link
            href="/browse"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            Browse
          </Link>
          <Link
            href="/schedule"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            Schedule
          </Link>
          {isLoggedIn && (
            <Link
              href="/bookmarks"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Bookmarks
            </Link>
          )}
          <UserNav />
        </div>
      </nav>
    </header>
  );
}
