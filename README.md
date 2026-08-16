# vince-welke.com

Personal portfolio site with an AI assistant that answers questions about my experience.

**Live:** [vince-welke.com](https://vince-welke.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **AI:** OpenAI API (`gpt-5.4-mini`)
- **Data:** Supabase (Postgres) for conversation logging
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions (lint → typecheck → build)

## Features

- AI assistant grounded in my resume and project history
- Rate limiting, origin locking, and prompt-injection filtering on the chat endpoint
- Private `/admin` console for reading past conversations
- GitHub contribution graph
- Fully responsive design

## Run Locally

```bash
npm install
npm run dev
```

Create a `.env` (gitignored) with:

| Variable               | Required for                                            |
| ---------------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY`       | the chat assistant                                      |
| `GITHUB_TOKEN`         | the contribution graph                                  |
| `SUPABASE_URL`         | conversation logging + `/admin`                         |
| `SUPABASE_SERVICE_KEY` | conversation logging + `/admin`                         |
| `ADMIN_PASSWORD`       | signing in to `/admin`                                  |
| `ADMIN_SESSION_SECRET` | signing the `/admin` session cookie (any random string) |

The site runs without the Supabase and admin variables — chat still works, logging is
skipped, and `/admin` shows a diagnostic instead of data.

## Database

Run these in the Supabase SQL Editor, in order. There is no migration runner.

1. `sql/001_chat_logs.sql` — the message table
2. `sql/002_chat_sessions.sql` — the per-conversation rollup view that `/admin` reads

## Admin console

`/admin` lists logged conversations newest-first, ten per page, and rebuilds any
conversation in full alongside the visitor context that came with it (approximate
location, referrer/UTM, device, language, timings, token counts).

Access is a password prompt at `/admin/login`, checked against `ADMIN_PASSWORD`.
A successful login sets an HTTP-only cookie signed with `ADMIN_SESSION_SECRET`
that expires after 12 hours. `src/proxy.ts` blocks every `/admin` and
`/api/admin` request that doesn't carry a valid cookie, so it is not reachable by
guessing a URL.

## Privacy

Chat conversations are logged for analytics. IP addresses are truncated before
storage (`/24` for IPv4, `/48` for IPv6) and precise coordinates are not collected —
location is city-level at best. The chat widget discloses that conversations are
logged.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # type check
```

## License

MIT
