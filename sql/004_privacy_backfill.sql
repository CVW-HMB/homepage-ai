-- 004 — Backfill the privacy changes over rows written before they shipped.
--
-- ⚠️  DESTRUCTIVE AND IRREVERSIBLE. Read this before running.
--
-- No rows are deleted — every conversation survives, all 76 rows stay. But this
-- script permanently destroys data *within* those rows:
--
--   * Overwrites the last octet of every stored IPv4 address in place.
--     38.186.212.138 becomes 38.186.212.0. The original cannot be recovered.
--   * Drops the latitude and longitude columns and everything in them.
--
-- That is the intended outcome — the application stopped collecting both, and
-- these are the rows captured before that change. But it is a one-way door, so
-- it is deliberately separate from 003, which is safe to run on its own.
--
-- Nothing here is required to clear the Supabase advisor findings; 003 does
-- that. Run this when you have decided you no longer want the old IP and
-- coordinate data.
--
-- STEP 0 — TAKE A BACKUP FIRST (recommended).
-- Uncomment and run this line on its own. It copies the whole table, so you can
-- restore anything you regret. Drop it later with:
--     DROP TABLE chat_logs_backup_pre_privacy;
--
-- CREATE TABLE chat_logs_backup_pre_privacy AS SELECT * FROM public.chat_logs;


-- 1. Truncate stored IPv4 addresses to a /24.
UPDATE public.chat_logs
SET ip_address = regexp_replace(ip_address, '^(\d+\.\d+\.\d+)\.\d+$', '\1.0')
WHERE ip_address ~ '^\d+\.\d+\.\d+\.\d+$';

-- 2. Remove precise coordinates entirely.
ALTER TABLE public.chat_logs DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.chat_logs DROP COLUMN IF EXISTS longitude;

-- 3. Repair percent-encoded geo values ("Saint%20Joseph"). Cosmetic and
--    effectively reversible; the application now decodes these before insert.
UPDATE public.chat_logs
SET city   = replace(city,   '%20', ' '),
    region = replace(region, '%20', ' ')
WHERE city ILIKE '%\%20%' OR region ILIKE '%\%20%';


-- Verify. Expect full_ips = 0 and encoded_cities = 0, with total_rows unchanged.
SELECT
    COUNT(*)                                                             AS total_rows,
    COUNT(*) FILTER (WHERE ip_address ~ '^\d+\.\d+\.\d+\.[1-9]')         AS full_ips,
    COUNT(*) FILTER (WHERE city LIKE '%\%20%')                           AS encoded_cities
FROM public.chat_logs;
