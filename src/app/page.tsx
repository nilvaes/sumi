import { getHome } from "@/lib/anilist/api";
import { MediaGrid } from "@/components/media-grid";
import { Section } from "@/components/section";

export default async function HomePage() {
  const data = await getHome();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <header className="max-w-2xl space-y-3">
        <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
          Discover the season.
        </h1>
        <p className="text-text-muted">
          Browse what&apos;s airing now, what&apos;s trending, and what&apos;s
          coming next. Sumi pulls live data from AniList with a clean,
          content-first interface.
        </p>
      </header>

      <Section title="Airing now">
        <MediaGrid items={data.airing?.media ?? []} />
      </Section>

      <Section title="Trending now">
        <MediaGrid items={data.trending?.media ?? []} />
      </Section>

      <Section title="Upcoming">
        <MediaGrid items={data.upcoming?.media ?? []} />
      </Section>
    </div>
  );
}
