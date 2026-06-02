import { describe, expect, it } from "vitest";
import { getCurrentSeason, formatSeason, isValidSeason } from "./season";

describe("getCurrentSeason", () => {
  it("maps months to AniList seasons", () => {
    expect(getCurrentSeason(new Date("2026-01-15"))).toEqual({
      season: "WINTER",
      year: 2026,
    });
    expect(getCurrentSeason(new Date("2026-04-15"))).toEqual({
      season: "SPRING",
      year: 2026,
    });
    expect(getCurrentSeason(new Date("2026-07-15"))).toEqual({
      season: "SUMMER",
      year: 2026,
    });
    expect(getCurrentSeason(new Date("2026-10-15"))).toEqual({
      season: "FALL",
      year: 2026,
    });
  });

  it("rolls December into the next year's winter", () => {
    expect(getCurrentSeason(new Date("2026-12-15"))).toEqual({
      season: "WINTER",
      year: 2027,
    });
  });
});

describe("formatSeason", () => {
  it("title-cases the enum", () => {
    expect(formatSeason("FALL")).toBe("Fall");
  });
});

describe("isValidSeason", () => {
  it("accepts valid seasons case-insensitively", () => {
    expect(isValidSeason("fall")).toBe(true);
    expect(isValidSeason("nope")).toBe(false);
  });
});
