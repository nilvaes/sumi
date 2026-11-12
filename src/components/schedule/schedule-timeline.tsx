"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useBookmarks } from "@/components/bookmarks/bookmark-provider";
import type { ScheduleEntry } from "@/lib/anilist/api";
import {
  getMyShows,
  getMyShowsServer,
  setMyShows,
  subscribeMyShows,
} from "@/lib/schedule/my-shows-pref";
import { cn } from "@/lib/utils";
import { ScheduleEpisodeCard } from "./schedule-episode-card";

type DayGroup = { key: string; date: Date; entries: ScheduleEntry[] };

/**
 * A tiny module-level clock store. Read only on the client (server snapshot is
 * null) so server (UTC) and client (visitor's timezone) agree during hydration;
 * ticks once a minute so countdowns stay fresh.
 */
const clock = (() => {
  let now = Date.now();
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();
  return {
    subscribe(onChange: () => void) {
      listeners.add(onChange);
      if (timer === null) {
        timer = setInterval(() => {
          now = Date.now();
          listeners.forEach((l) => l());
        }, 60_000);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    getSnapshot: () => now,
    getServerSnapshot: () => null,
  };
})();

function useNow(): number | null {
  return useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getServerSnapshot,
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(date: Date, now: Date): string {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(date) - startOf(now)) / 86400000);
  const weekday = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  if (diffDays === 0) return `Today · ${weekday}`;
  if (diffDays === 1) return `Tomorrow · ${weekday}`;
  return weekday;
}

export function ScheduleTimeline({ entries }: { entries: ScheduleEntry[] }) {
  const now = useNow();
  const { map: bookmarks, isLoggedIn } = useBookmarks();
  const myShowsPref = useSyncExternalStore(
    subscribeMyShows,
    getMyShows,
    getMyShowsServer,
  );
  // Only signed-in users have a Watching list to filter by.
  const myShows = isLoggedIn && myShowsPref;

  const visible = useMemo(
    () =>
      myShows
        ? entries.filter((e) => bookmarks[e.media.id] === "watching")
        : entries,
    [entries, bookmarks, myShows],
  );

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    for (const e of visible) {
      const date = new Date(e.airingAt * 1000);
      const key = dayKey(date);
      const group = map.get(key);
      if (group) group.entries.push(e);
      else map.set(key, { key, date, entries: [e] });
    }
    return [...map.values()];
  }, [visible]);

  const filter = isLoggedIn ? (
    <ScheduleFilter myShows={myShows} onChange={setMyShows} />
  ) : null;

  if (now === null) {
    return (
      <div className="space-y-16" aria-hidden>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-5">
            <div className="h-8 w-48 animate-pulse rounded bg-surface" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-2">
                  <div className="aspect-2/3 animate-pulse rounded-md bg-surface" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-surface" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="space-y-10">
        {filter}
        {myShows ? (
          <div className="space-y-4 py-12 text-center">
            <p className="text-sm text-text-muted">
              None of the anime in your Watching list air in the next seven days.
            </p>
            <Link
              href="/bookmarks?tab=watching"
              className="text-sm text-brand transition-colors hover:text-brand-hover"
            >
              View your Watching list →
            </Link>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-text-muted">
            Nothing scheduled in the next week.
          </p>
        )}
      </div>
    );
  }

  const nowDate = new Date(now);

  return (
    <div className="space-y-16">
      {filter}
      {groups.map((group) => (
        <section key={group.key} className="space-y-5">
          <h2 className="font-serif text-2xl text-text">
            {dayLabel(group.date, nowDate)}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {group.entries.map((e) => (
              <li key={e.id}>
                <ScheduleEpisodeCard entry={e} nowMs={now} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** "All anime / My shows" switch (signed-in users only). */
function ScheduleFilter({
  myShows,
  onChange,
}: {
  myShows: boolean;
  onChange: (value: boolean) => void;
}) {
  const options = [
    { value: false, label: "All anime" },
    { value: true, label: "My shows" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Which anime to show"
        className="inline-flex overflow-hidden rounded-sm border border-border bg-surface"
      >
        {options.map((o) => {
          const selected = o.value === myShows;
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "px-4 py-2 text-sm transition-colors",
                selected
                  ? "bg-bg font-medium text-text"
                  : "text-text-muted hover:bg-surface-hover hover:text-text",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {myShows && (
        <p className="text-xs text-text-muted">
          Showing only anime in your Watching list.
        </p>
      )}
    </div>
  );
}
