"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import type { SearchAnime } from "@/lib/supabase/search";

async function fetchSuggestions(
  term: string,
): Promise<{ results: SearchAnime[] }> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function SearchBox() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(id);
  }, [term]);

  const { data, isFetching } = useQuery({
    queryKey: ["suggestions", debounced],
    queryFn: () => fetchSuggestions(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goToAll() {
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const results = (data?.results ?? []).slice(0, 6);
  const showDropdown = open && debounced.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToAll();
        }}
      >
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 focus-within:border-brand">
          <SearchIcon className="size-4 shrink-0 text-text-muted" />
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                e.currentTarget.blur();
              }
            }}
            placeholder="Search anime…"
            aria-label="Search anime"
            className="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {isFetching && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-text-muted">No results.</p>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto">
              {results.map((m) => {
                const title =
                  m.title_english ?? m.title_romaji ?? "Untitled";
                return (
                  <li key={m.anilist_id}>
                    <Link
                      href={`/anime/${m.anilist_id}`}
                      onClick={() => {
                        setOpen(false);
                        setTerm("");
                      }}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-hover"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-surface">
                        {m.cover_image && (
                          <Image
                            src={m.cover_image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text">{title}</p>
                        <p className="text-xs text-text-muted">
                          {[m.format, m.season_year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={goToAll}
                  className="w-full px-3 py-2 text-left text-xs text-brand transition-colors hover:bg-surface-hover"
                >
                  See all results for “{debounced}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
