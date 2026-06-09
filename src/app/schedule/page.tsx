import type { Metadata } from "next";
import { AniListUnavailable } from "@/components/anilist-unavailable";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { getWeekSchedule } from "@/lib/anilist/api";
import { AniListError } from "@/lib/anilist/client";

export const metadata: Metadata = {
  title: "Airing schedule",
  description: "Anime airing over the next seven days, with episode countdowns.",
};

/** Fetched at request time — avoids build failures when AniList is down (502). */
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let entries: Awaited<ReturnType<typeof getWeekSchedule>> = [];
  let loadError = false;

  try {
    entries = await getWeekSchedule();
  } catch (err) {
    if (err instanceof AniListError) loadError = true;
    else throw err;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">
          Airing schedule
        </h1>
        <p className="text-text-muted">The next seven days, in your local time.</p>
      </header>
      {loadError ? (
        <AniListUnavailable />
      ) : (
        <ScheduleTimeline entries={entries} />
      )}
    </div>
  );
}
