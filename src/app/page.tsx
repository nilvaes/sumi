import { getHome } from "@/lib/anilist/api";
import { MediaGrid } from "@/components/media-grid";
import { Section } from "@/components/section";
import { getCurrentSeason, formatSeason } from "@/lib/utils/season";

export default async function HomePage() {
  const data = await getHome();
  const { season, year } = getCurrentSeason();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <header className="max-w-2xl space-y-3">
        <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
          Discover the season.
        </h1>
        <p className="text-text-muted">
          Browse trending, popular, and seasonal anime. Sumi pulls live data
          from AniList with a clean, content-first interface.
        </p>
      </header>

      <Section title="Trending now">
        <MediaGrid items={data.trending?.media ?? []} />
      </Section>

      <Section
        title={`${formatSeason(season)} ${year}`}
        href={`/season/${year}/${season.toLowerCase()}`}
      >
        <MediaGrid items={data.seasonal?.media ?? []} />
      </Section>

      <Section title="All-time popular">
        <MediaGrid items={data.popular?.media ?? []} />
      </Section>
    </div>
  );
}
