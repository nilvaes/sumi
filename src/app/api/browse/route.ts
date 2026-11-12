import { NextResponse } from "next/server";
import { getBrowse } from "@/lib/anilist/api";
import { parseBrowseFilters } from "@/lib/anilist/filters";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const MAX_PAGE = 100;

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
  const params = Object.fromEntries(searchParams.entries());
  const filters = parseBrowseFilters(params);
  const page = Math.min(MAX_PAGE, Math.max(1, Math.floor(Number(params.page)) || 1));

  try {
    const data = await getBrowse(filters, page);
    return NextResponse.json(data.Page);
  } catch {
    return NextResponse.json(
      { error: "Failed to load results" },
      { status: 502 },
    );
  }
}
