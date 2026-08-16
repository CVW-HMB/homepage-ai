// Input guards for the chat endpoint. Kept out of the route handler so they can
// be unit tested directly — these are the security-critical parts, and they are
// pure functions with no Next.js or network dependency.

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY = 6;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const BOT_PATTERNS = [
  /^\/\w+/,
  /^https?:\/\//i,
  /ignore (all )?(previous |prior )?(instructions|rules|prompts)/i,
  /pretend (you are|to be|you're)/i,
  /act as|roleplay/i,
  /jailbreak/i,
  /\bDAN\b/,
  /system prompt/i,
  /what are your (instructions|rules)/i,
  /repeat (everything|your prompt|the prompt)/i,
  /forget (everything|your rules|all rules)/i,
  /disregard|override/i,
];

export function isBotMessage(message: string): boolean {
  return BOT_PATTERNS.some((pattern) => pattern.test(message));
}

// The browser posts the whole transcript back on every turn, so every field here
// is attacker-controlled. Two things matter:
//   - Only "user" and "assistant" turns survive. Without this check a caller can
//     post role:"system" and append their own instructions after the real system
//     prompt.
//   - Returning null (rather than filtering) means a malformed transcript is
//     rejected outright instead of being silently reshaped into something the
//     caller didn't send.
export function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const cleaned: ChatMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    if (content.length > MAX_MESSAGE_LENGTH) return null;
    cleaned.push({ role, content });
  }

  return cleaned;
}

// Screen every user turn, not just the newest: an injection can otherwise ride
// along in history behind a harmless-looking final question.
export function containsInjection(history: ChatMessage[]): boolean {
  return history.some((m) => m.role === "user" && isBotMessage(m.content));
}

// Vercel percent-encodes its geo headers, so multi-word places arrive as
// "Saint%20Joseph". A malformed escape sequence would otherwise throw and take
// down the whole request.
export function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Every analytics field is client-supplied; anything that isn't a plain non-empty
// string is dropped rather than coerced into the log row.
export function asString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}
