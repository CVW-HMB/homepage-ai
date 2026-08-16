// Client IP handling.
//
// Two different values come out of here on purpose:
//   getClientIp()   -> full IP, used ONLY as an in-memory rate-limit key. Never persisted.
//   anonymizeIp()   -> truncated IP, the only form that is ever written to the database.
//
// `x-forwarded-for` is NOT trustworthy: a caller can send their own, and Vercel
// appends the real IP rather than replacing it, so the leftmost entry is
// attacker-controlled. Reading `.split(",")[0]` let anyone reset their rate-limit
// bucket by rotating the header. Prefer the headers Vercel injects itself
// (`x-vercel-forwarded-for`, `x-real-ip`), and fall back to the LAST xff entry,
// which is the hop closest to the trusted proxy.

export function getClientIp(headers: Headers): string | null {
  const vercelForwarded = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) return vercelForwarded.split(",").pop()?.trim() || null;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").pop()?.trim() || null;

  return null;
}

// Drop the host portion so stored rows can't be tied back to an individual.
// IPv4 keeps the /24, IPv6 keeps the /48 — enough to keep coarse abuse signal,
// not enough to identify a visitor. Conversation-level grouping still works via
// session_id, which is what the analytics actually key on.
export function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;

  if (ip.includes(":")) {
    const hextets = ip.split(":").filter(Boolean);
    if (hextets.length < 3) return null;
    return `${hextets.slice(0, 3).join(":")}::`;
  }

  const octets = ip.split(".");
  if (octets.length !== 4 || octets.some((o) => !/^\d{1,3}$/.test(o))) return null;
  return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
}
