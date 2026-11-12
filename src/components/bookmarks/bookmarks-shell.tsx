import { getBookmarkMapForUser } from "@/lib/bookmarks/db";
import { getCurrentUser } from "@/lib/supabase/user";
import { BookmarkProvider } from "./bookmark-provider";

/** Loads bookmark state once per request for signed-in users. */
export async function BookmarksShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

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
