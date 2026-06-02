"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * App Router can keep the previous page scroll position while loading.tsx
 * streams in. Reset when entering a detail route so the banner is in view.
 */
export function ScrollToTopOnNav() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname.startsWith("/anime/")) {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname]);

  return null;
}
