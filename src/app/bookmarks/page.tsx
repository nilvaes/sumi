import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkGridItem } from "@/components/bookmarks/bookmark-grid-item";
import {
  BookmarkTabs,
  parseBookmarkTab,
} from "@/components/bookmarks/bookmark-tabs";
import { AniListUnavailable } from "@/components/anilist-unavailable";
import type { CardMedia } from "@/components/anime-card";
import { getMediaByIds } from "@/lib/anilist/api";
import { AniListError } from "@/lib/anilist/client";
import { getBookmarksByStatus } from "@/lib/bookmarks/db";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your Watching, Planning, and Completed anime on Sumi.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/bookmarks");

  const tab = parseBookmarkTab((await searchParams).tab);
  let entries: Awaited<ReturnType<typeof getBookmarksByStatus>> = [];

  try {
    entries = await getBookmarksByStatus(user.id, tab);
  } catch {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">Bookmarks</h1>
        <p className="rounded-md border border-brand/40 bg-surface px-4 py-3 text-sm text-text-muted">
          Bookmarks table not found. Run the bookmarks section in{" "}
          <code className="text-text">supabase/schema.sql</code> in your Supabase
          SQL editor, then refresh.
        </p>
      </div>
    );
  }

  const ids = entries.map((e) => e.anilistId);
  let ordered: CardMedia[] = [];

  if (ids.length > 0) {
    try {
      const data = await getMediaByIds(ids);
      const byId = new Map(
        (data.Page?.media ?? [])
          .filter((m): m is NonNullable<typeof m> => m != null)
          .map((m) => [m.id, m as CardMedia]),
      );
      ordered = ids
        .map((id) => byId.get(id))
        .filter((m): m is CardMedia => m != null);
    } catch (err) {
      if (err instanceof AniListError) {
        return (
          <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <h1 className="font-serif text-3xl text-text sm:text-4xl">
              Bookmarks
            </h1>
            <BookmarkTabs active={tab} />
            <AniListUnavailable showSearchHint={false} />
          </div>
        );
      }
      throw err;
    }
  }

  const tabLabel =
    tab === "watching" ? "Watching" : tab === "planning" ? "Planning" : "Completed";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">Bookmarks</h1>
        <p className="text-sm text-text-muted">
          Your saved anime, grouped by status. Use Remove to clear a bookmark.
        </p>
      </header>

      <BookmarkTabs active={tab} />

      {ordered.length === 0 ? (
        <div className="space-y-4 py-8 text-center">
          <p className="text-sm text-text-muted">
            Nothing in {tabLabel} yet.
          </p>
          <Link
            href="/browse"
            className="text-sm text-brand transition-colors hover:text-brand-hover"
          >
            Browse anime →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {ordered.map((media) => (
            <BookmarkGridItem key={media.id} media={media} tab={tab} />
          ))}
        </div>
      )}
    </div>
  );
}
