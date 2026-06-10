import { AniListUnavailable } from "@/components/anilist-unavailable";
import { BookmarkTips } from "@/components/bookmarks/bookmark-legend-tip";
import { Hero } from "@/components/hero";
import { MediaGrid } from "@/components/media-grid";
import { Section } from "@/components/section";
import { getHome } from "@/lib/anilist/api";
import { AniListError } from "@/lib/anilist/client";

/** Fetched at request time — avoids build failures when AniList is down. */
export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10">
      <div className="space-y-4">
        <Hero items={data.featured?.media ?? []} />
        <BookmarkTips />
      </div>

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
