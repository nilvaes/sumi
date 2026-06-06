import { searchAnilist } from "@/lib/anilist/api";
import { searchAnimeDb, type SearchAnime } from "@/lib/supabase/search";

/** Must match `searchAnimeDb` page size in supabase/search.ts. */
const PER_PAGE = 24;

export type SearchSource = "db" | "anilist" | "hybrid";

export type SearchResponse = {
  results: SearchAnime[];
  hasNextPage: boolean;
  source: SearchSource;
};

function mergeResults(
  primary: SearchAnime[],
  extra: SearchAnime[],
): SearchAnime[] {
  const seen = new Set(primary.map((r) => r.anilist_id));
  const topUp = extra.filter((r) => !seen.has(r.anilist_id));
  return [...primary, ...topUp].slice(0, PER_PAGE);
}

/**
 * Hybrid title search.
 *
 * Supabase first (partial/fuzzy). AniList when:
 * - Supabase returns nothing, or
 * - Supabase returns an incomplete page (catalog miss / stale dataset) — DB
 *   hits stay first, AniList fills the rest.
 *
 * Pagination: while Supabase has a next page, only Supabase is used. After the
 * catalog is exhausted, later pages come from AniList.
 */
export async function searchHybrid(
  query: string,
  page = 1,
): Promise<SearchResponse> {
  const db = await searchAnimeDb(query, page);

  const catalogIncomplete =
    db.results.length > 0 &&
    db.results.length < PER_PAGE &&
    !db.hasNextPage;

  if (db.results.length > 0 && !catalogIncomplete) {
    return { results: db.results, hasNextPage: db.hasNextPage, source: "db" };
  }

  if (catalogIncomplete) {
    try {
      const anilist = await searchAnilist(query, page);
      const results = mergeResults(db.results, anilist.results);
      return {
        results,
        hasNextPage: anilist.hasNextPage,
        source: "hybrid",
      };
    } catch {
      return { results: db.results, hasNextPage: false, source: "db" };
    }
  }

  try {
    const anilist = await searchAnilist(query, page);
    return {
      results: anilist.results,
      hasNextPage: anilist.hasNextPage,
      source: "anilist",
    };
  } catch {
    return { results: [], hasNextPage: false, source: "anilist" };
  }
}
