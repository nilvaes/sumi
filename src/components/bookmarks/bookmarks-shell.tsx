import { createClient } from "@/lib/supabase/server";
import { getBookmarkMapForUser } from "@/lib/bookmarks/db";
import { BookmarkProvider } from "./bookmark-provider";

/** Loads bookmark state once per request for signed-in users. */
export async function BookmarksShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialMap = {};
  if (user) {
    try {
      initialMap = await getBookmarkMapForUser(user.id);
    } catch {
      // Table may not exist until the user runs supabase/schema.sql.
    }
  }

  return (
    <BookmarkProvider
      key={user?.id ?? "guest"}
      initialMap={initialMap}
      isLoggedIn={!!user}
    >
      {children}
    </BookmarkProvider>
  );
}
