# Database scripts

Run in numeric order in the Supabase SQL Editor. There is no migration runner —
these are applied by hand, so the numbering is the only record of what ran when.
All are idempotent and safe to re-run.

| #   | File                       | Destructive?           | What it does                                                            |
| --- | -------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| 001 | `001_chat_logs.sql`        | Creates a table        | The `chat_logs` table — one row per chat message                        |
| 002 | `002_chat_sessions.sql`    | No                     | Per-conversation rollup view; `/admin` needs this to list conversations |
| 003 | `003_enable_rls.sql`       | **No**                 | Enables row-level security. Clears both Supabase advisor CRITICALs      |
| 004 | `004_privacy_backfill.sql` | **Yes — irreversible** | Truncates stored IPs and drops the lat/long columns on existing rows    |

## Order and safety

001 → 002 → 003 can be run back to back with no risk to existing data. None of
them delete rows.

**004 is a one-way door.** It deletes no rows, but it overwrites IP addresses in
place and drops two columns permanently. It is not required to fix the advisor
findings — 003 does that. Take the backup it suggests at the top before running.

## Adding a column later

Adding a field to `chat_logs` means: a new numbered file here, running it in
Supabase, updating the `ChatLogData` interface in `src/app/api/chat/route.ts`
and all three `logChat` call sites, and — if `/admin` should surface it —
updating the `chat_sessions` view in a new numbered file too.
