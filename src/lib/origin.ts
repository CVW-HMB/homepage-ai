// Origin allowlist for the chat API.
//
// Without this the route answers any caller, so a script on another host (or a
// bare curl loop) can spend the OpenAI key directly. Browsers always send Origin
// on cross-origin POSTs, so rejecting unknown origins blocks the drive-by case.
// A request with no Origin header at all (curl, server-to-server) still gets
// through — the rate limiter is the backstop there.

const ALLOWED_ORIGINS = ["https://vince-welke.com", "https://www.vince-welke.com"];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // no Origin header: not a browser cross-origin request

  if (ALLOWED_ORIGINS.includes(origin)) return true;

  if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }

  // Vercel preview deployments for this project.
  if (/^https:\/\/homepage-ai-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;

  return false;
}
