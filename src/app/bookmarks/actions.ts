"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAnilistId, parseBookmarkStatus } from "@/lib/bookmarks/validate";
import { createClient } from "@/lib/supabase/server";

/*
  Server actions are public POST endpoints: TypeScript types are not enforced at
  runtime, so every argument is validated before it reaches Postgres.
*/

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function setBookmarkStatus(anilistId: unknown, status: unknown) {
  const id = parseAnilistId(anilistId);
  const parsedStatus = parseBookmarkStatus(status);
  if (id === null || parsedStatus === null) throw new Error("Invalid bookmark");

  const { supabase, userId } = await requireUser();

  const { error } = await supabase.from("bookmarks").upsert(
    {
      user_id: userId,
      anilist_id: id,
      status: parsedStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anilist_id" },
  );

  if (error) {
    console.error("[bookmarks] upsert failed:", error.code, error.message);
    throw new Error("Could not save bookmark");
  }

  revalidatePath("/bookmarks");
  revalidatePath(`/anime/${id}`);
}

export async function removeBookmark(anilistId: unknown) {
  const id = parseAnilistId(anilistId);
  if (id === null) throw new Error("Invalid bookmark");

  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("anilist_id", id);

  if (error) {
    console.error("[bookmarks] delete failed:", error.code, error.message);
    throw new Error("Could not remove bookmark");
  }

  revalidatePath("/bookmarks");
  revalidatePath(`/anime/${id}`);
}
