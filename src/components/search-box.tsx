"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import type { SearchAnime } from "@/lib/supabase/search";
import { cn } from "@/lib/utils";

async function fetchSuggestions(
  term: string,
): Promise<{ results: SearchAnime[] }> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  /** Highlighted suggestion for keyboard navigation (-1 = none). */
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

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
    setActiveIndex(-1);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const results = (data?.results ?? []).slice(0, 6);
  const showDropdown = open && debounced.length >= 2;
  // Options = each result plus the trailing "See all results" row.
  const optionCount = results.length > 0 ? results.length + 1 : 0;
  // Results can change under the highlight while typing; never point past the end.
  const active = showDropdown && activeIndex < optionCount ? activeIndex : -1;
  const optionId = (i: number) => `${listId}-option-${i}`;

  useEffect(() => {
    if (active < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function openResult(m: SearchAnime) {
    setOpen(false);
    setTerm("");
    setActiveIndex(-1);
    router.push(`/anime/${m.anilist_id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      e.currentTarget.blur();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (optionCount === 0) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      // Wraps around; from "nothing selected", Up goes to the last row.
      const from = active < 0 ? (step === 1 ? -1 : optionCount) : active;
      setActiveIndex((from + step + optionCount) % optionCount);
      return;
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      if (active < results.length) openResult(results[active]);
      else goToAll();
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-xs", className)}
    >
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
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search anime…"
            aria-label="Search anime"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown && optionCount > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            className="w-full bg-transparent text-base text-text placeholder:text-text-muted focus:outline-none md:text-sm"
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
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Search suggestions"
              className="max-h-[70vh] overflow-y-auto"
            >
              {results.map((m, i) => {
                const title =
                  m.title_english ?? m.title_romaji ?? "Untitled";
                return (
                  <li
                    key={m.anilist_id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={active === i}
                    data-index={i}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <Link
                      href={`/anime/${m.anilist_id}`}
                      prefetch
                      tabIndex={-1}
                      onClick={() => {
                        setOpen(false);
                        setTerm("");
                        setActiveIndex(-1);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 transition-colors",
                        active === i && "bg-brand/10 shadow-[inset_3px_0_0_0_var(--brand)]",
                      )}
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
              <li
                id={optionId(results.length)}
                role="option"
                aria-selected={active === results.length}
                data-index={results.length}
                onMouseEnter={() => setActiveIndex(results.length)}
                className="border-t border-border"
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={goToAll}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs text-brand transition-colors",
                    active === results.length && "bg-brand/10 shadow-[inset_3px_0_0_0_var(--brand)]",
                  )}
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
