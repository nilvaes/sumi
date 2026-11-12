import { describe, expect, it } from "vitest";
import {
  anilistIdFromSources,
  entryToFields,
  isAdultEntry,
  mergeDatasetFields,
  reachedHighWater,
  type DatasetFields,
} from "./catalog";

const base: DatasetFields = {
  title_romaji: "Sousou no Frieren",
  synonyms: ["Frieren"],
  cover_image: "https://s4.anilist.co/a.jpg",
  format: "TV",
  season_year: 2023,
  episodes: 28,
};

describe("mergeDatasetFields", () => {
  it("inserts rows we don't have", () => {
    expect(mergeDatasetFields(undefined, base)).toEqual({ row: base, changed: true });
  });

  it("reports unchanged rows so they aren't rewritten", () => {
    expect(mergeDatasetFields(base, { ...base, synonyms: ["Frieren"] }).changed).toBe(false);
  });

  it("takes newer dataset values", () => {
    const { row, changed } = mergeDatasetFields(base, { ...base, episodes: 29 });
    expect(changed).toBe(true);
    expect(row.episodes).toBe(29);
  });

  it("never blanks out values we already know", () => {
    const { row, changed } = mergeDatasetFields(base, {
      title_romaji: null,
      synonyms: [],
      cover_image: null,
      format: null,
      season_year: null,
      episodes: null,
    });
    expect(changed).toBe(false);
    expect(row).toEqual(base);
  });
});

describe("reachedHighWater", () => {
  it("keeps going while every id on the page is newer than what we had", () => {
    expect(reachedHighWater([300, 299, 250], 200)).toBe(false);
  });

  it("stops once the page reaches the newest id we had", () => {
    expect(reachedHighWater([210, 205, 200], 200)).toBe(true);
    expect(reachedHighWater([210, 150], 200)).toBe(true);
  });

  it("stops on an empty page", () => {
    expect(reachedHighWater([], 200)).toBe(true);
  });
});

describe("dataset parsing", () => {
  it("reads the AniList id from sources", () => {
    expect(
      anilistIdFromSources(["https://myanimelist.net/anime/1", "https://anilist.co/anime/154587"]),
    ).toBe(154587);
    expect(anilistIdFromSources(["https://myanimelist.net/anime/1"])).toBeNull();
  });

  it("flags adult entries by tag, case-insensitively", () => {
    const e = { sources: [], title: "x", type: "OVA", episodes: 1 };
    expect(isAdultEntry({ ...e, tags: ["Hentai"] })).toBe(true);
    expect(isAdultEntry({ ...e, tags: ["ecchi"] })).toBe(false);
  });

  it("maps unknown formats to null", () => {
    const f = entryToFields({ sources: [], title: "x", type: "UNKNOWN", episodes: null });
    expect(f.format).toBeNull();
  });
});
