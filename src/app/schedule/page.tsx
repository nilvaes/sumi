import type { Metadata } from "next";
import { getWeekSchedule } from "@/lib/anilist/api";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";

export const metadata: Metadata = {
  title: "Airing schedule",
  description: "Anime airing over the next seven days, with episode countdowns.",
};

export default async function SchedulePage() {
  const entries = await getWeekSchedule();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">
          Airing schedule
        </h1>
        <p className="text-text-muted">The next seven days, in your local time.</p>
      </header>
      <ScheduleTimeline entries={entries} />
    </div>
  );
}
