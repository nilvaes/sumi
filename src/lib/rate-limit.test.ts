import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit within a window, then blocks", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 10).ok).toBe(true);
    expect(check("a", 20).ok).toBe(true);
    const blocked = check("a", 30);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(1);
  });

  it("tracks keys separately", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("b", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(false);
  });

  it("resets after the window", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 500).ok).toBe(false);
    expect(check("a", 1000).ok).toBe(true);
  });
});
