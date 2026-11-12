import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * Daily keep-alive, called by Vercel Cron (see vercel.json).
 *
 * Supabase pauses free-tier projects after ~7 days without database activity.
 * The weekly GitHub Action used to cover this, but GitHub disables scheduled
 * workflows after 60 days without commits — which is exactly how the project
 * ended up paused. Vercel crons don't expire, so this pings the database daily.
 *
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set in
 * the project's env vars. Without a configured secret the route refuses to run,
 * so it can't be used as a free way to hammer the database.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !isAuthorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("anime").select("anilist_id").limit(1);
  if (error) {
    console.error("keepalive: supabase query failed", error.message);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}

function isAuthorized(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
