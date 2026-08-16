-- Per-conversation rollup used by the /admin console.
-- Run this in the Supabase SQL Editor after sql/001_chat_logs.sql.
--
-- One row per session_id, so the console can paginate conversations directly
-- (ORDER BY last_at DESC, 10 per page) instead of pulling every message row
-- and grouping client-side.

-- security_invoker = true is load-bearing. Postgres views default to running
-- with the *owner's* privileges, so a view owned by the superuser would read
-- straight through any row-level security on chat_logs — handing the anon role
-- a way around it. With security_invoker the view is evaluated as the caller,
-- so RLS on the underlying table still applies. (Supabase's own database linter
-- flags the default as `security_definer_view`.) Requires Postgres 15+.
CREATE OR REPLACE VIEW chat_sessions
WITH (security_invoker = true) AS
SELECT
    session_id,
    MIN(created_at)                                          AS started_at,
    MAX(created_at)                                          AS last_at,
    COUNT(*)::int                                            AS message_count,
    NULLIF(SUM(COALESCE(tokens_used, 0)), 0)::int            AS total_tokens,
    COUNT(*) FILTER (WHERE error IS NOT NULL)::int           AS error_count,

    -- Visitor attributes are captured per message but are effectively constant
    -- for a session; take the value from the first message of the conversation.
    (ARRAY_AGG(country     ORDER BY message_index))[1]       AS country,
    (ARRAY_AGG(region      ORDER BY message_index))[1]       AS region,
    (ARRAY_AGG(city        ORDER BY message_index))[1]       AS city,
    (ARRAY_AGG(referrer    ORDER BY message_index))[1]       AS referrer,
    (ARRAY_AGG(utm_source  ORDER BY message_index))[1]       AS utm_source,
    (ARRAY_AGG(user_agent  ORDER BY message_index))[1]       AS user_agent,
    (ARRAY_AGG(user_message ORDER BY message_index))[1]      AS first_message
FROM chat_logs
GROUP BY session_id;

COMMENT ON VIEW chat_sessions IS 'Per-conversation rollup of chat_logs, powering the /admin console list view';

-- Supports ORDER BY last_at DESC on the view.
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_created
    ON chat_logs (session_id, created_at DESC);
