import { AniListUnavailable } from "@/components/anilist-unavailable";
import { getBrowse } from "@/lib/anilist/api";
import { AniListError } from "@/lib/anilist/client";
import type { BrowseFilters } from "@/lib/anilist/filters";
import { BrowseResults } from "./browse-results";

/** Server-fetched first page; wrapped in Suspense so the browse shell renders immediately. */
export async function BrowseResultsServer({
  filters,
}: {
  filters: BrowseFilters;
}) {
  let initialPage: Awaited<ReturnType<typeof getBrowse>>["Page"] | undefined;
  let loadError = false;

  try {
    const data = await getBrowse(filters, 1);
    initialPage = data.Page;
  } catch (err) {
    if (err instanceof AniListError) loadError = true;
    else throw err;
  }

  if (loadError) return <AniListUnavailable />;
  return <BrowseResults filters={filters} initialPage={initialPage} />;
}
