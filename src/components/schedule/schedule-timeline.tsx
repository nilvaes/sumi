"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ScheduleEntry } from "@/lib/anilist/api";
import { formatCountdown, formatLabel } from "@/lib/utils/format";

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

function timeLabel(airingAt: number): string {
  return new Date(airingAt * 1000).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
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
      <div className="space-y-3" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-md border border-border bg-surface"
          />
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
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h2 className="sticky top-[57px] z-10 -mx-4 bg-bg/90 px-4 py-2 font-serif text-xl text-text backdrop-blur">
            {dayLabel(group.date, nowDate)}
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
            {group.entries.map((e) => {
              const title =
                e.media.title?.english ?? e.media.title?.romaji ?? "Untitled";
              const cover = e.media.coverImage?.large;
              const secondsUntil = e.airingAt - Math.floor(now / 1000);
              return (
                <li key={e.id}>
                  <Link
                    href={`/anime/${e.media.id}`}
                    prefetch
                    className="flex items-center gap-4 bg-surface/40 px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <time className="w-16 shrink-0 text-sm tabular-nums text-text-muted">
                      {timeLabel(e.airingAt)}
                    </time>
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface">
                      {cover && (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{title}</p>
                      <p className="text-xs text-text-muted">
                        {[`Episode ${e.episode}`, formatLabel(e.media.format)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-text-muted">
                      {secondsUntil > 0 ? (
                        <>
                          <span className="mr-1 inline-block size-1.5 rounded-full bg-brand align-middle" />
                          {formatCountdown(secondsUntil)}
                        </>
                      ) : (
                        "Aired"
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
