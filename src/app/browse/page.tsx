import type { Metadata } from "next";
import { BrowseControls } from "@/components/browse/browse-controls";
import { BrowseResults } from "@/components/browse/browse-results";
import { browseHeading, parseBrowseFilters } from "@/lib/anilist/filters";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const filters = parseBrowseFilters(await searchParams);
  return { title: browseHeading(filters) };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseBrowseFilters(await searchParams);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <h1 className="font-serif text-3xl text-text sm:text-4xl">
        {browseHeading(filters)}
      </h1>
      <BrowseControls filters={filters} />
      <BrowseResults filters={filters} />
    </div>
  );
}
