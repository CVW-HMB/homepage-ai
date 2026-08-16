import { describe, expect, it } from "vitest";
import { anonymizeIp, getClientIp } from "./clientIp";

const h = (init: Record<string, string>) => new Headers(init);

describe("getClientIp", () => {
  // The bug this guards against: keying the rate limiter on the leftmost
  // x-forwarded-for entry let any caller reset their own quota by sending the
  // header themselves. Vercel appends the real IP rather than replacing it, so
  // the caller-supplied value sits first.
  it("ignores a caller-supplied x-forwarded-for prefix", () => {
    const spoofed = h({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" });
    expect(getClientIp(spoofed)).toBe("203.0.113.7");
    expect(getClientIp(spoofed)).not.toBe("9.9.9.9");
  });

  it("prefers the Vercel-injected header over x-forwarded-for", () => {
    const headers = h({
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-forwarded-for": "9.9.9.9",
      "x-real-ip": "8.8.8.8",
    });
    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when no Vercel header is present", () => {
    expect(getClientIp(h({ "x-real-ip": "8.8.8.8", "x-forwarded-for": "9.9.9.9" }))).toBe(
      "8.8.8.8"
    );
  });

  it("handles a single-entry x-forwarded-for", () => {
    expect(getClientIp(h({ "x-forwarded-for": "203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("tolerates whitespace around entries", () => {
    expect(getClientIp(h({ "x-forwarded-for": "9.9.9.9 ,  203.0.113.7 " }))).toBe("203.0.113.7");
  });

  it("returns null when nothing identifies the caller", () => {
    expect(getClientIp(h({}))).toBeNull();
  });

  it("returns null rather than an empty string for a blank header", () => {
    expect(getClientIp(h({ "x-forwarded-for": "" }))).toBeNull();
  });

  // Two callers behind different proxies must not collapse into one bucket.
  it("distinguishes different trusted IPs", () => {
    const a = getClientIp(h({ "x-forwarded-for": "1.1.1.1, 203.0.113.7" }));
    const b = getClientIp(h({ "x-forwarded-for": "1.1.1.1, 203.0.113.8" }));
    expect(a).not.toBe(b);
  });
});

describe("anonymizeIp", () => {
  it("truncates IPv4 to a /24", () => {
    expect(anonymizeIp("38.186.212.138")).toBe("38.186.212.0");
    expect(anonymizeIp("104.165.194.7")).toBe("104.165.194.0");
  });

  it("keeps an already-truncated address stable (idempotent)", () => {
    expect(anonymizeIp("38.186.212.0")).toBe("38.186.212.0");
    expect(anonymizeIp(anonymizeIp("38.186.212.138"))).toBe("38.186.212.0");
  });

  it("truncates IPv6 to a /48", () => {
    expect(anonymizeIp("2001:db8:85a3:8d3:1319:8a2e:370:7348")).toBe("2001:db8:85a3::");
  });

  it("passes null through", () => {
    expect(anonymizeIp(null)).toBeNull();
  });

  it("rejects malformed input rather than storing it", () => {
    expect(anonymizeIp("not-an-ip")).toBeNull();
    expect(anonymizeIp("1.2.3")).toBeNull();
    expect(anonymizeIp("1.2.3.4.5")).toBeNull();
    expect(anonymizeIp("999.999.999.abc")).toBeNull();
  });

  // The whole point: the stored value must not identify a single machine.
  it("collapses hosts within a /24 to the same value", () => {
    expect(anonymizeIp("38.186.212.1")).toBe(anonymizeIp("38.186.212.254"));
  });
});
