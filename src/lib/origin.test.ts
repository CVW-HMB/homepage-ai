import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedOrigin } from "./origin";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isAllowedOrigin", () => {
  it.each(["https://vince-welke.com", "https://www.vince-welke.com"])("allows %s", (origin) => {
    expect(isAllowedOrigin(origin)).toBe(true);
  });

  it.each([
    "https://evil.example.com",
    "https://vince-welke.com.evil.com",
    "https://notvince-welke.com",
    "http://vince-welke.com", // downgraded scheme
    "null",
  ])("rejects %s", (origin) => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin(origin)).toBe(false);
  });

  it("allows Vercel preview deployments for this project", () => {
    expect(isAllowedOrigin("https://homepage-ai-git-some-branch-abc123.vercel.app")).toBe(true);
  });

  it("rejects an unrelated vercel.app project", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin("https://someone-elses-app.vercel.app")).toBe(false);
  });

  // Non-browser callers (curl, server-to-server) send no Origin at all. The rate
  // limiter is the backstop there; blocking them would break legitimate probes.
  it("allows a request with no Origin header", () => {
    expect(isAllowedOrigin(null)).toBe(true);
  });

  it("allows localhost in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
  });

  it("rejects localhost in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin("http://localhost:3000")).toBe(false);
  });
});
