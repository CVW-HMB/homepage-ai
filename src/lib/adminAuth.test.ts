import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkPassword, createSessionCookie, verifySessionCookie } from "./adminAuth";

const SECRET = "test-secret-value";

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
  process.env.ADMIN_PASSWORD = "correct-horse";
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_PASSWORD;
});

describe("session cookie", () => {
  it("issues a cookie that verifies", async () => {
    const cookie = await createSessionCookie();
    expect(cookie).toBeTruthy();
    await expect(verifySessionCookie(cookie!)).resolves.toBe(true);
  });

  it("rejects a tampered signature", async () => {
    const cookie = (await createSessionCookie())!;
    const [expiry] = cookie.split(".");
    await expect(verifySessionCookie(`${expiry}.forged`)).resolves.toBe(false);
  });

  // The expiry is inside the signed payload, so extending it invalidates the MAC.
  it("rejects an extended expiry", async () => {
    const cookie = (await createSessionCookie())!;
    const signature = cookie.slice(cookie.lastIndexOf(".") + 1);
    const future = String(Date.now() + 10 * 365 * 86_400_000);
    await expect(verifySessionCookie(`${future}.${signature}`)).resolves.toBe(false);
  });

  it("rejects a cookie signed with a different secret", async () => {
    const cookie = (await createSessionCookie())!;
    process.env.ADMIN_SESSION_SECRET = "a-different-secret";
    await expect(verifySessionCookie(cookie)).resolves.toBe(false);
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const cookie = (await createSessionCookie())!;
    vi.setSystemTime(new Date("2020-01-02T12:00:00Z")); // > 12h later
    await expect(verifySessionCookie(cookie)).resolves.toBe(false);
  });

  it("still accepts a cookie inside the window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const cookie = (await createSessionCookie())!;
    vi.setSystemTime(new Date("2020-01-01T11:00:00Z")); // < 12h later
    await expect(verifySessionCookie(cookie)).resolves.toBe(true);
  });

  it.each([undefined, "", "garbage", ".", "abc.def", "12345", "notanumber.sig"])(
    "rejects malformed cookie %j",
    async (value) => {
      await expect(verifySessionCookie(value as string | undefined)).resolves.toBe(false);
    }
  );

  // Fails closed: no secret configured must never mean "everyone is admin".
  it("refuses to issue or verify without a secret", async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(await createSessionCookie()).toBeNull();
    await expect(verifySessionCookie("1999999999999.sig")).resolves.toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepts the configured password", () => {
    expect(checkPassword("correct-horse")).toBe(true);
  });

  it.each(["wrong", "", "correct-hors", "correct-horsee", "CORRECT-HORSE"])(
    "rejects %j",
    (candidate) => {
      expect(checkPassword(candidate)).toBe(false);
    }
  );

  it("rejects non-string input", () => {
    expect(checkPassword(undefined)).toBe(false);
    expect(checkPassword(null)).toBe(false);
    expect(checkPassword({})).toBe(false);
    expect(checkPassword(12345)).toBe(false);
  });

  it("fails closed when no password is configured", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkPassword("")).toBe(false);
    expect(checkPassword("anything")).toBe(false);
  });
});
