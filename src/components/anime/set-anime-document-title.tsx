"use client";

import { useEffect } from "react";

/** Tab title after detail loads; generateMetadata stays fast so navigation isn't blocked. */
export function SetAnimeDocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} · Sumi`;
  }, [title]);

  return null;
}
