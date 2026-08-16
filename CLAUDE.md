# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build
npm run lint       # eslint (flat config, eslint-config-next)
npx tsc --noEmit   # type check — run this; the build alone won't catch everything
```

There is no test suite. CI (`.github/workflows/ci.yml`, Node 20) runs exactly three gates on push/PR to `main`: `npm run lint`, `npx tsc --noEmit`, `npm run build`. A Husky pre-commit hook runs `lint-staged` (eslint --fix + prettier on staged files).

## Environment

Secrets live in a local `.env` (gitignored). All are server-only, never `NEXT_PUBLIC_`:

- `OPENAI_API_KEY` — chat route
- `GITHUB_TOKEN` — GitHub GraphQL contributions query
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — chat logging + `/admin` (service key, so it bypasses RLS; keep it server-side)
- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` — the `/admin` console; without them login always fails closed

`getSupabase()` in `src/lib/supabase.ts` throws if the Supabase vars are missing, but only at first call — the GitHub route and the static page work without them.

## Architecture

Next.js 16 App Router, React 19, Tailwind v4 (`@import "tailwindcss"` in `globals.css`, no tailwind.config), deployed on Vercel. Path alias `@/*` → `src/*`.

Four moving parts, all in `src/`:

**`app/page.tsx`** — the entire portfolio is one server component of hardcoded JSX sections (hero, how I work, projects, experience, contact). Content lives inline, not in data files; editing the site means editing this file. Resume PDF is served statically from `public/Vince_Welke_Resume.pdf`.

**Chat (`components/Chat.tsx` → `app/api/chat/route.ts`)** — the substantive subsystem. The client generates a `sessionId` once per mount and an incrementing `messageIndex`, and posts the full message array plus referrer/pageUrl on every turn. The route:

1. Rejects cross-origin POSTs via `lib/origin.ts`, then rate limits — `lib/rateLimit.ts`, in-memory `Map`, 20 req/hour, keyed on the trusted client IP from `lib/clientIp.ts`. **Never key anything off `x-forwarded-for[0]`** — it is caller-controlled, and doing so previously let anyone reset their own quota by rotating the header. The limiter is still per-serverless-instance and resets on cold start; Redis/Upstash is the real fix.
2. `sanitizeMessages()` rejects any role other than `user`/`assistant` — the browser posts the whole transcript back, so without this a caller could inject their own `system` turn. Then it screens **every** user turn against `BOT_PATTERNS` (prompt-injection / jailbreak regexes), not just the newest, since an injection can otherwise ride along in history behind a harmless final question. A match short-circuits with a canned reply logged as `error: "bot_filtered"` — the OpenAI call never happens.
3. Validates: non-empty `messages`, required `sessionId`, last message ≤ 500 chars (mirrored by `maxLength` on the input).
4. Calls OpenAI `gpt-5.4-mini` via plain `fetch` (no SDK dependency), sending `SYSTEM_PROMPT` plus only the last `MAX_HISTORY` (6) turns. Two GPT-5-family constraints: the parameter is `max_completion_tokens` (`max_tokens` is rejected outright), and `reasoning_effort: "none"` keeps this recall-style task fast. `SYSTEM_PROMPT` must stay first and byte-identical — that is what makes OpenAI's automatic prompt caching reuse ~2.3k of the ~2.6k prompt tokens. Putting anything variable ahead of it silently disables caching.
5. Logs every outcome (success, OpenAI error, bot-filtered) to Supabase `chat_logs` via `logChat`, which swallows its own errors so logging failures never break a reply.

`SYSTEM_PROMPT` is a large inline template literal at the top of the route holding Vince's biography, response-style examples, and security rules. It is the source of truth for what the assistant knows — biography changes go here, and they should stay consistent with `page.tsx` and the resume PDF. Note the deliberate two-layer prompt-injection defense: regex prefilter plus in-prompt security rules.

**Admin console (`app/admin/*` + `components/AdminConsole.tsx` + `lib/conversations.ts`)** — password-gated reader for logged conversations: ten per page, newest first, with the full transcript and visitor context rebuilt on demand. Pagination is a real windowed query against the `chat_sessions` view, not a fetch-everything-and-group-in-JS.

Auth is a signed cookie, not a session store: `lib/adminAuth.ts` HMACs an expiry stamp with `ADMIN_SESSION_SECRET`. **`src/proxy.ts` is the gate** — it must be named `proxy.ts`, live beside `app/`, and export a function named `proxy`. Next 16 renamed the `middleware` convention; a `middleware.ts` at the repo root is silently ignored and everything under `/admin` becomes public with no error.

**GitHub widget (`components/GitHubContributions.tsx` → `app/api/github/route.ts`)** — client-side fetch of a server route that runs a hardcoded GraphQL contributions query for login `CVW-HMB`, cached with `next: { revalidate: 3600 }`.

## Chat logging schema

`sql/001_chat_logs.sql` is the table definition, applied by hand in the Supabase SQL Editor — there are no migrations. The `ChatLogData` interface in the chat route mirrors it column-for-column; adding a field means editing the SQL, running it in Supabase, and updating both the interface and all three `logChat` call sites. Geo columns (country/region/city) come from `x-vercel-ip-*` headers and are null in local dev. Two deliberate privacy constraints: `ip_address` stores only a **truncated** address (`lib/clientIp.ts` — the full one is used solely as the in-memory rate-limit key), and precise lat/long is not collected at all.

`sql/002_chat_sessions.sql` defines the `chat_sessions` view the admin console reads. Adding a column to `chat_logs` that the console should surface means updating that view too.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
