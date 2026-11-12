import { describe, expect, it } from "vitest";
import { parseAnilistId, parseBookmarkStatus } from "./validate";

describe("parseAnilistId", () => {
  it("accepts positive integers", () => {
    expect(parseAnilistId(1)).toBe(1);
    expect(parseAnilistId(171018)).toBe(171018);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 2_147_483_648, "123", null, undefined, {}])(
    "rejects %j",
    (value) => {
      expect(parseAnilistId(value)).toBeNull();
    },
  );
});

describe("parseBookmarkStatus", () => {
  it("accepts known statuses", () => {
    expect(parseBookmarkStatus("watching")).toBe("watching");
    expect(parseBookmarkStatus("planning")).toBe("planning");
    expect(parseBookmarkStatus("completed")).toBe("completed");
  });

  it.each(["dropped", "WATCHING", "", 1, null])("rejects %j", (value) => {
    expect(parseBookmarkStatus(value)).toBeNull();
  });
});
