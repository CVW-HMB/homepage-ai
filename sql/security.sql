-- Lock down chat_logs. Paste this whole file into the Supabase SQL Editor and run it.
-- Idempotent and order-independent: safe to re-run, and it does not matter whether
-- sql/chat_sessions.sql has been run yet.
--
-- FIXES THESE TWO SUPABASE ADVISOR FINDINGS (both the same root cause):
--   CRITICAL  RLS Disabled in Public — table public.chat_logs is public, but RLS
--             has not been enabled.
--   CRITICAL  Sensitive Columns Exposed — chat_logs is exposed via API without RLS.
--
-- WHY IT MATTERS
-- Every Supabase project ships a publishable (anon) key that is meant to be public —
-- it is designed to go in browser code. It is only safe because row-level security
-- stands behind it. A table created by hand in the SQL Editor does NOT get RLS
-- enabled automatically, so chat_logs is currently readable by anyone holding that
-- key: every logged conversation, plus the IP and location captured with it.
--
-- THE APP IS UNAFFECTED. It connects with the service key, which bypasses RLS by
-- design. Nothing below needs a code change or a redeploy.


-- 1. Enable RLS. This alone clears both advisor findings.
--    With RLS on and no permissive policy, anon and authenticated get zero rows.
--    That is the intent: nothing should read this table except the server, which
--    uses the service key and is exempt. No policy is needed or wanted.
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;


-- 2. Belt and braces — also remove the table grants Supabase gives the public
--    roles by default, so access is refused at the privilege layer as well.
--    (If you ever want to read this table with the publishable key from the
--    browser, you would re-grant SELECT here and add an explicit RLS policy.)
REVOKE ALL ON TABLE public.chat_logs FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'chat_sessions' AND relkind = 'v') THEN
    REVOKE ALL ON TABLE public.chat_sessions FROM anon, authenticated;
  END IF;
END $$;


-- 3. Backfill the privacy change. Rows written before IP truncation shipped still
--    hold full addresses and precise coordinates. New rows are already truncated
--    by the application.
UPDATE public.chat_logs
SET ip_address = regexp_replace(ip_address, '^(\d+\.\d+\.\d+)\.\d+$', '\1.0')
WHERE ip_address ~ '^\d+\.\d+\.\d+\.\d+$';

ALTER TABLE public.chat_logs DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.chat_logs DROP COLUMN IF EXISTS longitude;


-- 4. Repair historically percent-encoded geo values ("Saint%20Joseph").
--    The application now decodes these before insert.
UPDATE public.chat_logs
SET city   = replace(city,   '%20', ' '),
    region = replace(region, '%20', ' ')
WHERE city ILIKE '%\%20%' OR region ILIKE '%\%20%';


-- 5. Verify. Read the three result sets below.
--    Expected: rls_enabled = true; the grants query returns ZERO rows; and
--    chat_sessions (if created) shows security_invoker=true.

SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('chat_logs');

SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('chat_logs', 'chat_sessions')
  AND grantee IN ('anon', 'authenticated');

SELECT relname, reloptions
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname = 'chat_sessions';
