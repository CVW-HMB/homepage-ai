-- chat_logs table for conversation tracking
-- Run this in Supabase SQL Editor

CREATE TABLE chat_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Conversation threading
    session_id TEXT NOT NULL,
    message_index INTEGER NOT NULL,
    
    -- Content
    user_message TEXT NOT NULL,
    assistant_response TEXT,
    
    -- Visitor identity
    ip_address TEXT,
    
    -- Geographic (from Vercel headers; city-level only — precise coordinates are
    -- deliberately not collected)
    country TEXT,
    region TEXT,
    city TEXT,
    
    -- Device/browser
    user_agent TEXT,
    language TEXT,
    
    -- Traffic source
    referrer TEXT,
    page_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Performance/cost
    model TEXT,
    tokens_used INTEGER,
    cached_tokens INTEGER,
    duration_ms INTEGER,
    error TEXT
);

-- This file is the table as it should look on a fresh project. If the table
-- already exists, do NOT re-run it — apply the numbered migrations instead
-- (005 adds cached_tokens; 004 removes the legacy latitude/longitude columns
--  and truncates historical IPs).

-- Indexes
CREATE INDEX idx_chat_logs_created_at ON chat_logs (created_at);
CREATE INDEX idx_chat_logs_session_id ON chat_logs (session_id);
CREATE INDEX idx_chat_logs_referrer ON chat_logs (referrer);

-- Comments
COMMENT ON TABLE chat_logs IS 'Stores chatbot conversations for user research and traffic analysis';
COMMENT ON COLUMN chat_logs.session_id IS 'Groups messages into conversations';
COMMENT ON COLUMN chat_logs.message_index IS 'Order of message within session (0, 1, 2...)';
COMMENT ON COLUMN chat_logs.ip_address IS 'Truncated to /24 (IPv4) or /48 (IPv6) — the full address is never stored';
COMMENT ON COLUMN chat_logs.cached_tokens IS 'Prompt tokens served from OpenAI prompt cache (billed at a discount)';
