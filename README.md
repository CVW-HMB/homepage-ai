# vince-welke.com

Personal portfolio site with an AI assistant that answers questions about my experience,
plus a private console for reading the resulting conversations.

**Live:** [vince-welke.com](https://vince-welke.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **AI:** OpenAI API (`gpt-5.4-mini`), with automatic prompt caching
- **Data:** Supabase (Postgres) for conversation logging
- **Tests:** Vitest
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions — lint → typecheck → test → build

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

**These must also be set in Vercel**, per environment. Vercel only picks up variable
changes on a new deployment, so redeploy after editing them.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # serve the production build
npm test           # unit tests (vitest)
npm run test:watch # tests in watch mode
npm run lint       # eslint
npx tsc --noEmit   # type check
```

## Database

Run the numbered scripts in `sql/` in the Supabase SQL Editor. There is no migration
runner — they are applied by hand, and the numbering is the record of what ran.
See [`sql/README.md`](sql/README.md) for what each does and which are destructive.

## Admin console

`/admin` lists logged conversations newest-first, ten per page, and rebuilds any
conversation in full alongside the visitor context that came with it (approximate
location, referrer/UTM, device, language, timings, token counts).

**Log in at `/admin/login`** — bookmark that URL specifically. When you are not signed
in, `/admin` returns a 404 rather than redirecting, so the console's existence is not
disclosed to anyone probing the site. That means there is no link to follow; you need
the login URL directly. Sessions last 12 hours.

To reuse this pattern in another project, [`CLAUDE-ADMIN-CONSOLE.md`](CLAUDE-ADMIN-CONSOLE.md) is a
standalone build guide.

## Privacy

Chat conversations are logged for analytics. IP addresses are truncated before storage
(`/24` for IPv4, `/48` for IPv6) and precise coordinates are not collected — location is
city-level at best. The chat widget discloses that conversations are logged.

Row-level security is enabled on `chat_logs`, so the table is not readable with the
project's publishable key.

## License

MIT
