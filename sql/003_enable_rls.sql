-- 003 — Enable row-level security on chat_logs.
--
-- NON-DESTRUCTIVE. Reads and writes no row data. This only changes who is
-- allowed to read the table. Every existing row is untouched.
--
-- Run this in the Supabase SQL Editor. Idempotent, and it does not matter
-- whether 002_chat_sessions.sql has been run yet.
--
-- FIXES BOTH SUPABASE ADVISOR FINDINGS (they share one root cause):
--   CRITICAL  RLS Disabled in Public
--   CRITICAL  Sensitive Columns Exposed
--
-- WHY IT MATTERS
-- Every Supabase project ships a publishable (anon) key that is meant to be
-- public — it is designed to go in browser code. It is only safe because RLS
-- stands behind it. A table created by hand in the SQL Editor does NOT get RLS
-- enabled automatically, so chat_logs is currently readable by anyone holding
-- that key.
--
-- THE APP IS UNAFFECTED. It connects with the service key, which bypasses RLS
-- by design. No code change and no redeploy are needed.


-- With RLS on and no permissive policy, anon and authenticated get zero rows.
-- That is the intent: nothing should read this table except the server, which
-- uses the service key and is exempt. No policy is needed or wanted.
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;


-- Belt and braces — also drop the grants Supabase gives the public roles by
-- default, so access is refused at the privilege layer too. (To read this table
-- from the browser later, re-grant SELECT here and add an explicit RLS policy.)
REVOKE ALL ON TABLE public.chat_logs FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'chat_sessions' AND relkind = 'v') THEN
    REVOKE ALL ON TABLE public.chat_sessions FROM anon, authenticated;
  END IF;
END $$;


-- Verify. Expect rls_enabled = true, and ZERO rows from the grants query.
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname = 'chat_logs';

SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('chat_logs', 'chat_sessions')
  AND grantee IN ('anon', 'authenticated');
