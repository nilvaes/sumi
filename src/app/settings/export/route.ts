import { NextResponse } from "next/server";
import { getAppOriginFromHeaders } from "@/lib/app-origin";
import { toCsv, type ExportRow } from "@/lib/bookmarks/export";
import type { BookmarkStatus } from "@/lib/bookmarks/types";
import { createRateLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/** Matches the per-user cap enforced by the bookmarks_enforce_limit trigger. */
const MAX_BOOKMARKS = 5000;
/** PostgREST returns at most 1000 rows per request by default, so page through. */
const PAGE = 1000;
/** Ids per `in (...)` title lookup, keeping the request URL short. */
const TITLE_CHUNK = 300;

// Exports are cheap but not free; a few per minute per user is plenty.
const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

type Row = { anilist_id: number; status: BookmarkStatus; updated_at: string };

/** Download the signed-in user's bookmarks: /settings/export?format=csv|json */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to export bookmarks" }, { status: 401 });
  }

  const rl = limiter(user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const format =
    new URL(request.url).searchParams.get("format") === "json" ? "json" : "csv";

  const bookmarks: Row[] = [];
  for (let from = 0; from < MAX_BOOKMARKS; from += PAGE) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("anilist_id, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("[export] bookmarks query failed:", error.code, error.message);
      return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
    bookmarks.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE) break;
  }

  // Titles come from the synced catalog (no AniList calls). Missing ones stay null.
  const titles = new Map<number, string>();
  const ids = bookmarks.map((b) => b.anilist_id);
  for (let i = 0; i < ids.length; i += TITLE_CHUNK) {
    const { data } = await supabase
      .from("anime")
      .select("anilist_id, title_english, title_romaji")
      .in("anilist_id", ids.slice(i, i + TITLE_CHUNK));
    for (const a of data ?? []) {
      const title = a.title_english ?? a.title_romaji;
      if (title) titles.set(a.anilist_id, title);
    }
  }

  const origin = getAppOriginFromHeaders(request.headers);
  const rows: ExportRow[] = bookmarks.map((b) => ({
    anilist_id: b.anilist_id,
    title: titles.get(b.anilist_id) ?? null,
    status: b.status,
    updated_at: b.updated_at,
    url: `${origin}/anime/${b.anilist_id}`,
  }));

  const date = new Date().toISOString().slice(0, 10);
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="sumi-bookmarks-${date}.${format}"`,
  };

  if (format === "json") {
    return new NextResponse(
      JSON.stringify({ exportedAt: new Date().toISOString(), bookmarks: rows }, null, 2),
      { headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } },
    );
  }
  // BOM so Excel opens UTF-8 (Japanese titles, accents) correctly.
  return new NextResponse(`﻿${toCsv(rows)}`, {
    headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
  });
}
