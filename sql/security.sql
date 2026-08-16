-- Lock down chat_logs. Run this in the Supabase SQL Editor after chat_logs.sql
-- and chat_sessions.sql. Safe to re-run.
--
-- WHY THIS MATTERS
-- Every Supabase project ships a publishable (anon) key that is designed to be
-- public — it goes in browser code. It is only safe because row-level security
-- is supposed to stand behind it. A table created by hand in the SQL Editor does
-- NOT get RLS enabled automatically (unlike one created through the dashboard's
-- table editor), so `chat_logs` may currently be readable by anyone holding that
-- publishable key. This site never uses the publishable key, but the key exists
-- on the project regardless.
--
-- The app is unaffected by everything below: it connects with the service key,
-- which bypasses RLS by design.

-- 1. Turn RLS on. With no permissive policy, this denies all anon/authenticated
--    access while leaving the service key's access untouched.
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- 2. Belt and braces: remove the table grants Supabase hands the public roles by
--    default, so access is refused at the privilege layer too, not just by RLS.
REVOKE ALL ON TABLE chat_logs FROM anon, authenticated;
REVOKE ALL ON TABLE chat_sessions FROM anon, authenticated;

-- 3. Backfill the privacy change: existing rows still hold full IP addresses and
--    precise coordinates captured before truncation was added. New rows are
--    already truncated by the application.
UPDATE chat_logs
SET ip_address = regexp_replace(ip_address, '^(\d+\.\d+\.\d+)\.\d+$', '\1.0')
WHERE ip_address ~ '^\d+\.\d+\.\d+\.\d+$';

ALTER TABLE chat_logs DROP COLUMN IF EXISTS latitude;
ALTER TABLE chat_logs DROP COLUMN IF EXISTS longitude;

-- 4. Repair historically percent-encoded geo values ("Saint%20Joseph").
--    The application now decodes these before insert.
UPDATE chat_logs
SET city   = replace(city, '%20', ' '),
    region = replace(region, '%20', ' ')
WHERE city LIKE '%\%20%' OR region LIKE '%\%20%';

-- 5. Verify. Expect rowsecurity = true, and no anon/authenticated grants.
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('chat_logs');

SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('chat_logs', 'chat_sessions')
  AND grantee IN ('anon', 'authenticated');

-- Confirms the view is security_invoker (expect security_invoker=true).
SELECT c.relname, c.reloptions
FROM pg_class c
WHERE c.relname = 'chat_sessions';
