"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface hover:text-text"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="size-4" aria-hidden />
      </button>

      <div
        className={cn(
          "absolute top-full right-0 z-50 min-w-36 pt-1 transition-opacity duration-300 ease-out motion-reduce:transition-none",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div
          className="overflow-hidden rounded-md border border-border bg-bg py-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/settings"
            role="menuitem"
            className="block px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
          >
            Settings
          </Link>
          <form action={signOut} role="none">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
