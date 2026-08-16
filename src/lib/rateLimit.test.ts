import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rateLimit";

// The limiter holds module-level state, so each test uses a distinct key.
const key = (name: string) => `${name}-${Math.random()}`;

describe("checkRateLimit", () => {
  it("allows the first request and counts down", () => {
    const k = key("first");
    const first = checkRateLimit(k);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(19);
    expect(checkRateLimit(k).remaining).toBe(18);
  });

  it("allows exactly 20 requests then blocks", () => {
    const k = key("cap");
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(k).allowed).toBe(true);
    }
    const blocked = checkRateLimit(k);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("stays blocked once over the cap", () => {
    const k = key("stays");
    for (let i = 0; i < 25; i++) checkRateLimit(k);
    expect(checkRateLimit(k).allowed).toBe(false);
  });

  // Buckets must be per-key, or one visitor exhausts everyone else's quota.
  it("tracks distinct keys independently", () => {
    const a = key("a");
    const b = key("b");
    for (let i = 0; i < 20; i++) checkRateLimit(a);
    expect(checkRateLimit(a).allowed).toBe(false);
    expect(checkRateLimit(b).allowed).toBe(true);
  });

  it("namespaced keys do not collide with bare IPs", () => {
    const ip = key("1.2.3.4");
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).allowed).toBe(false);
    expect(checkRateLimit(`admin-login:${ip}`).allowed).toBe(true);
  });
});
