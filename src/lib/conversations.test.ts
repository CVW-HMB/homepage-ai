import { describe, expect, it } from "vitest";
import { formatDuration, formatLocation } from "./conversations";

describe("formatLocation", () => {
  it("joins the parts it has", () => {
    expect(formatLocation({ city: "Tampa", region: "FL", country: "US" })).toBe("Tampa, FL, US");
  });

  it("skips missing parts", () => {
    expect(formatLocation({ city: null, region: "FL", country: "US" })).toBe("FL, US");
    expect(formatLocation({ city: null, region: null, country: "US" })).toBe("US");
  });

  it("falls back when nothing is known", () => {
    expect(formatLocation({ city: null, region: null, country: null })).toBe("Unknown location");
  });
});

describe("formatDuration", () => {
  const at = (ms: number) => new Date(ms).toISOString();

  it("reports sub-second spans as <1s", () => {
    expect(formatDuration(at(0), at(400))).toBe("<1s");
  });

  it("reports seconds", () => {
    expect(formatDuration(at(0), at(45_000))).toBe("45s");
  });

  it("reports minutes and seconds", () => {
    expect(formatDuration(at(0), at(125_000))).toBe("2m 5s");
  });

  it("handles a single-message conversation (zero span)", () => {
    expect(formatDuration(at(0), at(0))).toBe("<1s");
  });

  it("does not throw on an unparseable timestamp", () => {
    expect(() => formatDuration("nonsense", at(0))).not.toThrow();
  });
});
