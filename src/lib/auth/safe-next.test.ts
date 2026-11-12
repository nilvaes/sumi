import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/anime/123")).toBe("/anime/123");
    expect(safeNextPath("/bookmarks?tab=planning")).toBe("/bookmarks?tab=planning");
    expect(safeNextPath("/settings#danger")).toBe("/settings#danger");
  });

  it("falls back for empty values", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it.each([
    "@evil.com",
    ".evil.com",
    "evil.com",
    "https://evil.com",
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "javascript:alert(1)",
    "/%5cevil.com/../",
  ])("rejects %j", (value) => {
    const result = safeNextPath(value);
    expect(new URL(result, "https://sumi.example").host).toBe("sumi.example");
  });

  it("does not loop back into the auth flow", () => {
    expect(safeNextPath("/login")).toBe("/");
    expect(safeNextPath("/auth/callback?code=x")).toBe("/");
  });
});
