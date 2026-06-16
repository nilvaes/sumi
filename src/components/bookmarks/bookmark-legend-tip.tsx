import { BookmarkTipsClient } from "@/components/bookmarks/bookmark-tips-client";
import { createClient } from "@/lib/supabase/server";

/** Icon legend + sign-in prompt (when logged out), shown under the home hero. */
export async function BookmarkTips() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <BookmarkTipsClient showSignInTip={!user} />;
}
