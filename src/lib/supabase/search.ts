import { supabase } from "./client";

export type SearchAnime = {
  anilist_id: number;
  title_romaji: string | null;
  title_english: string | null;
  cover_image: string | null;
  cover_color: string | null;
  format: string | null;
  season_year: number | null;
};

const PER_PAGE = 24;

/**
 * Substring/trigram search over the synced catalog. Unlike AniList's whole-word
 * search, this matches partial words (e.g. "daemon" -> "Daemons …"). Ranking is
 * done by the `search_anime` SQL function (exact > prefix > similarity > shortest).
 */
export async function searchAnimeDb(
  query: string,
  page = 1,
): Promise<{ results: SearchAnime[]; hasNextPage: boolean }> {
  // LIKE wildcards are escaped inside search_anime(); stripping them here too keeps
  // results consistent on databases that haven't applied the 2026-11-12 migration.
  const term = query.replace(/[%_\\]/g, " ").trim().slice(0, 100);
  if (term.length < 2) return { results: [], hasNextPage: false };

  const off = Math.min((page - 1) * PER_PAGE, 10_000);

  const { data, error } = await supabase.rpc("search_anime", {
    q: term,
    lim: PER_PAGE,
    off,
  });

  if (error) throw error;

  const results = (data ?? []) as SearchAnime[];
  return { results, hasNextPage: results.length === PER_PAGE };
}
