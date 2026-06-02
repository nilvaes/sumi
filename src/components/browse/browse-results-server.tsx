import { getBrowse } from "@/lib/anilist/api";
import type { BrowseFilters } from "@/lib/anilist/filters";
import { BrowseResults } from "./browse-results";

/** Server-fetched first page; wrapped in Suspense so the browse shell renders immediately. */
export async function BrowseResultsServer({
  filters,
}: {
  filters: BrowseFilters;
}) {
  const data = await getBrowse(filters, 1);
  return <BrowseResults filters={filters} initialPage={data.Page} />;
}
