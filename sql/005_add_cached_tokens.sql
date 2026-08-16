-- 005 — Add the cached_tokens column.
--
-- NON-DESTRUCTIVE. Adds one nullable column. No rows are read, changed, or
-- deleted. Existing rows get NULL.
--
-- REQUIRED. The application writes this field on every log insert. Until the
-- column exists, Postgres rejects the whole row and no conversation is logged
-- at all — silently, because logChat() swallows its own errors so a logging
-- failure never breaks a chat reply.
--
-- It records how many prompt tokens OpenAI served from its cache, so you can
-- see the caching saving per conversation.

ALTER TABLE public.chat_logs ADD COLUMN IF NOT EXISTS cached_tokens INTEGER;

COMMENT ON COLUMN public.chat_logs.cached_tokens
    IS 'Prompt tokens served from the OpenAI prompt cache (billed at a discount)';

-- Verify: expect one row back.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chat_logs'
  AND column_name = 'cached_tokens';
