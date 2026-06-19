"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; auth?: boolean }[] = [
  { href: "/browse", label: "Browse" },
  { href: "/schedule", label: "Schedule" },
  { href: "/bookmarks", label: "Bookmarks", auth: true },
];

const PANEL_MS = 300;

export function MobileNavMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(false);

  const openMenu = () => {
    setShow(true);
    requestAnimationFrame(() => setActive(true));
  };

  const closeMenu = () => setActive(false);

  useEffect(() => {
    if (!active && show) {
      const id = setTimeout(() => setShow(false), PANEL_MS);
      return () => clearTimeout(id);
    }
  }, [active, show]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface hover:text-text"
        aria-label="Open menu"
        aria-expanded={active}
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-60 md:hidden">
            <button
              type="button"
              className={cn(
                "absolute inset-0 bg-black/70 transition-opacity duration-300 ease-out motion-reduce:transition-none",
                active ? "opacity-100" : "opacity-0",
              )}
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <aside
              className={cn(
                "absolute inset-y-0 left-0 z-10 flex w-[min(100%,16rem)] flex-col border-r border-border bg-bg shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
                active ? "translate-x-0" : "-translate-x-full",
              )}
            >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <span className="font-serif text-xl tracking-tight text-text">
                  Sumi
                </span>
                <span className="font-jp text-xl leading-none text-text-muted">
                  墨
                </span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="flex size-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
                aria-label="Close menu"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-3">
              {LINKS.filter((l) => !l.auth || isLoggedIn).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border p-3">
              {isLoggedIn ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/settings"
                    onClick={closeMenu}
                    className="rounded-md px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                  >
                    Settings
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full rounded-md px-3 py-2.5 text-left text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block rounded-md px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  Sign in
                </Link>
              )}
            </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
