import { NextResponse } from "next/server";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { searchHybrid } from "@/lib/search";

const MAX_QUERY = 100;
const MAX_PAGE = 50;

// Search-as-you-type fires a request per keystroke (debounced), so allow bursts.
const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(request: Request) {
  const rl = limiter(clientIp(request));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY);
  const page = Math.min(MAX_PAGE, Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1));

  if (q.length < 2) {
    return NextResponse.json({ results: [], hasNextPage: false, source: "db" });
  }

  try {
    const data = await searchHybrid(q, page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
