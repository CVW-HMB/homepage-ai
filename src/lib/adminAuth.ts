// Session cookie for the /admin console.
//
// The cookie is a signed expiry stamp — `<expiresAtMs>.<hmac>` — so no session
// store is needed and a tampered or expired cookie fails verification. Signing
// uses Web Crypto so this module works unchanged in Edge middleware and in the
// Node runtime.
//
// Two env vars are required for /admin to work at all:
//   ADMIN_PASSWORD        the password you type on the login page
//   ADMIN_SESSION_SECRET  a random string used to sign the cookie
// If either is missing, every login attempt fails closed.

export const ADMIN_COOKIE = "vw_admin";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function toBase64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

// Length-independent comparison so a mismatch can't be timed.
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let diff = aBytes.length ^ bBytes.length;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionCookie(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = String(Date.now() + SESSION_MS);
  return `${expiresAt}.${await sign(expiresAt, secret)}`;
}

export async function verifySessionCookie(value: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !value) return false;

  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;

  const expiresAt = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;

  return timingSafeEqual(signature, await sign(expiresAt, secret));
}

export function checkPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string") return false;
  return timingSafeEqual(candidate, expected);
}

export const SESSION_MAX_AGE_SECONDS = SESSION_MS / 1000;
