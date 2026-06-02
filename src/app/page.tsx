import { getHome } from "@/lib/anilist/api";
import { MediaGrid } from "@/components/media-grid";
import { Section } from "@/components/section";
import { Hero } from "@/components/hero";

export default async function HomePage() {
  const data = await getHome();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
      <Hero items={data.featured?.media ?? []} />

      <Section title="Airing now" href="/browse?status=RELEASING">
        <MediaGrid items={data.airing?.media ?? []} />
      </Section>

      <Section title="Trending now" href="/browse?sort=TRENDING_DESC">
        <MediaGrid items={data.trending?.media ?? []} />
      </Section>

      <Section title="Upcoming" href="/browse?status=NOT_YET_RELEASED">
        <MediaGrid items={data.upcoming?.media ?? []} />
      </Section>
    </div>
  );
}
