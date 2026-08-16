# Building a private logging console

A portable guide to the `/admin` console in this repo — a password-gated page that reads
logged conversations out of Postgres, paginates them, and rebuilds each one in full
alongside the metadata captured with it.

Drop this file into another project as a `CLAUDE.md` (or alongside one) to rebuild the
same thing. It assumes Next.js App Router + Supabase, and calls out what to change if
your stack differs. Everything here was built and verified in production; the
**Pitfalls** section is the part that will actually save you time, because every item in
it is a mistake that was made here first.

---

## What you get

- A list of conversations, newest first, **N per page**, paginated with a real windowed
  SQL query
- A scrollable picker showing location / length / device / traffic source so you can
  choose what to read
- Full transcript rebuilt on demand, with visitor context beside it
- Password login, signed cookie sessions, no session store
- Unauthenticated requests get **404**, not a login redirect
- Excluded from search engines

## File map

| File                                                  | Role                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/proxy.ts`                                        | The gate. Blocks every `/admin` and `/api/admin` request without a valid cookie |
| `src/lib/adminAuth.ts`                                | Cookie signing/verification (HMAC) and password check                           |
| `src/app/admin/login/page.tsx`                        | Login form                                                                      |
| `src/app/api/admin/login/route.ts`                    | Issues and clears the session cookie                                            |
| `src/app/admin/layout.tsx`                            | `noindex` metadata for everything under `/admin`                                |
| `src/app/admin/page.tsx`                              | Server component: fetches page N, renders error states                          |
| `src/components/AdminConsole.tsx`                     | Client component: picker, pagination, transcript pane                           |
| `src/lib/conversations.ts`                            | Data layer — list, detail, formatters, logging-health check                     |
| `src/app/api/admin/conversation/[sessionId]/route.ts` | Detail endpoint                                                                 |
| `sql/002_chat_sessions.sql`                           | Per-conversation rollup view                                                    |
| `sql/003_enable_rls.sql`                              | Row-level security                                                              |

## Data model

Two layers. The log table is **one row per message**:

```
id, created_at, session_id, message_index,
user_message, assistant_response,
ip_address, country, region, city, user_agent, language,
referrer, page_url, utm_source, utm_medium, utm_campaign,
model, tokens_used, cached_tokens, duration_ms, error
```

`session_id` groups messages into a conversation; `message_index` orders them within it.
The client generates `session_id` once per page load and increments `message_index`.

The console works in _conversations_, not messages, so a **view** does the rollup:

```sql
CREATE OR REPLACE VIEW chat_sessions
WITH (security_invoker = true) AS
SELECT
    session_id,
    MIN(created_at) AS started_at,
    MAX(created_at) AS last_at,
    COUNT(*)::int   AS message_count,
    COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS error_count,
    (ARRAY_AGG(city         ORDER BY message_index))[1] AS city,
    (ARRAY_AGG(user_message ORDER BY message_index))[1] AS first_message
    -- ...one ARRAY_AGG per visitor attribute
FROM chat_logs
GROUP BY session_id;
```

**Why a view and not JS grouping.** Pagination has to happen in the database. Fetching
every row and grouping in the app means "page 1" costs a full table scan plus a client
side sort, and it silently gets slower forever. With the view, page N is
`.order("last_at", {ascending:false}).range(from, from + 9)` and the count comes from
one `count: "exact"` header. Visitor attributes are per-message but constant per
session, so `(ARRAY_AGG(x ORDER BY message_index))[1]` takes the first message's value.

## Auth model

A signed expiry stamp in an HTTP-only cookie — `<expiresAtMs>.<hmac>`:

```ts
const expiresAt = String(Date.now() + SESSION_MS);
const cookie = `${expiresAt}.${await sign(expiresAt, secret)}`;
```

Verification re-signs the expiry and compares. No session table, no Redis, nothing to
expire on the server. Tampering with the timestamp invalidates the MAC, so a user can't
extend their own session.

Two env vars, both fail closed if absent: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

Use **Web Crypto** (`crypto.subtle`), not `node:crypto`, so the same module works in
edge and Node runtimes. Compare with a length-independent loop rather than `===`.

### 404, not a redirect

Redirecting an unauthenticated visitor to `/admin/login` confirms an admin console
exists. Returning 404 makes `/admin` indistinguishable from any other missing path:

```ts
if (pathname.startsWith("/api/")) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
```

The trade-off is real: there is now no link to the login page, so you must bookmark
`/admin/login`. Worth it for anything you'd rather nobody knew about.

### Keeping it out of search results

Three layers, and one counterintuitive rule:

1. `X-Robots-Tag: noindex, nofollow` on `/admin/*` via `next.config.ts` headers
2. `robots: { index: false }` metadata in `src/app/admin/layout.tsx`
3. Absent from `sitemap.ts`

**Do not add `Disallow: /admin` to robots.txt.** robots.txt is public, so the entry
advertises the exact path — and a disallowed URL can still be indexed as a bare link,
because the crawler is forbidden from fetching the page and therefore never sees the
`noindex` that would have excluded it. Silence plus `noindex` is strictly stronger.

## Porting checklist

1. Copy `src/lib/adminAuth.ts` unchanged.
2. Copy `src/proxy.ts`; edit `config.matcher` and the two public-path exceptions.
3. Copy `src/lib/conversations.ts`; change the table/view names and the row interfaces.
4. Copy the `admin/` pages and `AdminConsole.tsx`; adjust the fields rendered.
5. Write the rollup view for your schema — keep `security_invoker = true`.
6. Enable RLS on the log table.
7. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in every deployment environment.
8. Add the `noindex` header rule and keep the path out of robots.txt and the sitemap.

**Not on Next.js?** The pieces that transfer directly are the cookie scheme, the
404-not-redirect rule, the rollup-view pagination, and the RLS/`security_invoker`
requirements. Only `proxy.ts` is framework-specific — any before-request hook works.

**Not on Supabase?** `conversations.ts` is the only file that knows about the client.
Swap the two queries; the rest is unchanged.

---

## Pitfalls

Each of these cost real debugging time here.

**Next 16 renamed `middleware` to `proxy`.** The file must be `proxy.ts`, sit beside
`app/` (so `src/proxy.ts` in a `src/` project), and export a function named `proxy`. A
`middleware.ts` at the repo root is **silently ignored** — no warning, no error, and
every gated route serves normally to the public. Always test unauthenticated access
rather than assuming the gate is live.

**Postgres views default to the view owner's privileges.** A view over an RLS-protected
table reads straight through that RLS unless you declare
`WITH (security_invoker = true)`. Supabase's linter flags this as `security_definer_view`.
Getting RLS right on the table and forgetting it on the view leaves the data exposed.

**A hand-created table has RLS off.** Tables made in the SQL Editor do not get RLS
enabled (only the dashboard table editor does that). The project's publishable key is
public _by design_ and is only safe because RLS stands behind it. Enable it explicitly:

```sql
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
```

With RLS on and **no policy**, anon gets zero rows and the service key still works —
that is the desired end state for a server-only table. No policy is needed.

**Swallowing logging errors makes outages invisible.** Logging should never break a user
facing reply, so the insert is wrapped in try/catch. The cost is that a broken database
looks exactly like a quiet week. Logging here stopped for 89 days unnoticed, then broke
again immediately afterward for a different reason. Keep the catch, but surface staleness
where you'll see it:

```ts
export async function getLoggingHealth() {
  // newest row's age; console renders a banner past a threshold
}
```

**A new column in the app is a migration, not an edit to the CREATE TABLE.** Adding a
field to the insert payload and to the fresh-project schema file does nothing to an
existing table. Postgres then rejects **every** insert with `column ... does not exist`
— and if errors are swallowed, silently. Number your migrations and treat the CREATE
TABLE file as fresh-install only.

**Number the SQL files.** With no migration runner, the filename is the only record of
what ran and in what order. `001_`, `002_`… plus a `sql/README.md` marking which are
destructive.

**Separate destructive scripts from safe ones.** A security fix and an irreversible data
backfill were initially one file, which meant enabling RLS required also destroying data.
Split them so the safe fix can be applied on its own.

**Client-supplied query shapes vary by library version.** `supabase-js` `.range()` sends
`offset`/`limit` query params, not a `Range` header. If you write a test stub, log the
actual request before asserting against it.

## Tests

`npm test` (vitest). The suite covers the pure security-critical logic — cookie
signing/expiry/tampering, password check, trusted-IP extraction, IP anonymisation,
origin allowlisting, injection screening, and rate limiting.

What unit tests can't cover is whether the gate is actually wired up. Verify that
separately against a **production build** (`npm run start`, not `npm run dev`) with a
script that asserts status codes for: unauthenticated page, unauthenticated API, deep
path, trailing slash, uppercase path, forged cookie, expired cookie, empty cookie, wrong
password, robots.txt contents, and sitemap contents.
