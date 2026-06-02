import { NextResponse } from "next/server";
import { getBrowse } from "@/lib/anilist/api";
import { parseBrowseFilters } from "@/lib/anilist/filters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const filters = parseBrowseFilters(params);
  const page = Math.max(1, Number(params.page) || 1);

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
