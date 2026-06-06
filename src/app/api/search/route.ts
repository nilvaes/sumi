import { NextResponse } from "next/server";
import { searchHybrid } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

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
