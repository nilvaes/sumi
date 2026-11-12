import type { BookmarkStatus } from "./types";

export type ExportRow = {
  anilist_id: number;
  title: string | null;
  status: BookmarkStatus;
  updated_at: string;
  url: string;
};

const COLUMNS: (keyof ExportRow)[] = ["anilist_id", "title", "status", "updated_at", "url"];

/**
 * One CSV cell. Quotes every value, doubles embedded quotes, and prefixes values
 * that start with = + - @ (or tab / CR) with `'` so spreadsheet apps don't run
 * them as formulas (CSV injection).
 */
export function csvCell(value: string | number | null): string {
  if (value === null) return '""';
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** CSV with a header row and CRLF line endings (what Excel expects). */
export function toCsv(rows: ExportRow[]): string {
  const lines = [COLUMNS.join(",")];
  for (const row of rows) lines.push(COLUMNS.map((c) => csvCell(row[c])).join(","));
  return `${lines.join("\r\n")}\r\n`;
}
