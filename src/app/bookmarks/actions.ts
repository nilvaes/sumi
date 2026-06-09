"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BookmarkStatus } from "@/lib/bookmarks/types";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function setBookmarkStatus(anilistId: number, status: BookmarkStatus) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase.from("bookmarks").upsert(
    {
      user_id: userId,
      anilist_id: anilistId,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anilist_id" },
  );

  if (error) throw error;

  revalidatePath("/bookmarks");
  revalidatePath(`/anime/${anilistId}`);
}

export async function removeBookmark(anilistId: number) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("anilist_id", anilistId);

  if (error) throw error;

  revalidatePath("/bookmarks");
  revalidatePath(`/anime/${anilistId}`);
}
