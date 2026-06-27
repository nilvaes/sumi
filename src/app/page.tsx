import { AniListUnavailable } from "@/components/anilist-unavailable";
import { Hero } from "@/components/hero";
import { MediaGrid } from "@/components/media-grid";
import { Section } from "@/components/section";
import { getHome } from "@/lib/anilist/api";
import { AniListError } from "@/lib/anilist/client";

/** ISR — matches getHome() fetch cache (3h). try/catch keeps builds safe when AniList is down. */
export const revalidate = 10_800;

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof getHome>> | null = null;
  let loadError = false;

  try {
    data = await getHome();
  } catch (err) {
    if (err instanceof AniListError) loadError = true;
    else throw err;
  }

  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <AniListUnavailable />
      </div>
    );
  }

  return (
    <>
      <Hero items={data.featured?.media ?? []} />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
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
    </>
  );
}
