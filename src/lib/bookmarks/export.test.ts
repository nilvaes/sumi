import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./export";

describe("csvCell", () => {
  it("quotes values and doubles embedded quotes", () => {
    expect(csvCell('Say "hi", ok')).toBe('"Say ""hi"", ok"');
    expect(csvCell(42)).toBe('"42"');
    expect(csvCell(null)).toBe('""');
  });

  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+1")).toBe('"\'+1"');
    expect(csvCell("@cmd")).toBe('"\'@cmd"');
    expect(csvCell("-2")).toBe('"\'-2"');
  });

  it("leaves numbers alone even when negative", () => {
    expect(csvCell(-1)).toBe('"-1"');
  });
});

describe("toCsv", () => {
  it("writes a header and one CRLF line per row", () => {
    const csv = toCsv([
      {
        anilist_id: 1,
        title: "Cowboy Bebop",
        status: "completed",
        updated_at: "2026-01-01T00:00:00Z",
        url: "https://example.com/anime/1",
      },
    ]);
    expect(csv).toBe(
      'anilist_id,title,status,updated_at,url\r\n"1","Cowboy Bebop","completed","2026-01-01T00:00:00Z","https://example.com/anime/1"\r\n',
    );
  });
});
