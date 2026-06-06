"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ScheduleEntry } from "@/lib/anilist/api";
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

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    for (const e of entries) {
      const date = new Date(e.airingAt * 1000);
      const key = dayKey(date);
      const group = map.get(key);
      if (group) group.entries.push(e);
      else map.set(key, { key, date, entries: [e] });
    }
    return [...map.values()];
  }, [entries]);

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
      <p className="py-12 text-center text-sm text-text-muted">
        Nothing scheduled in the next week.
      </p>
    );
  }

  const nowDate = new Date(now);

  return (
    <div className="space-y-16">
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
