import type { Metadata } from "next";
import { SearchResults } from "@/components/search/search-results";

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "" } = await searchParams;
  const term = q.trim();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <h1 className="font-serif text-3xl text-text sm:text-4xl">
        {term ? (
          <>
            Results for <span className="text-brand">“{term}”</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <SearchResults q={term} />
    </div>
  );
}
