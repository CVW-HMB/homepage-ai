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
    
    -- Geographic (from Vercel headers)
    country TEXT,
    region TEXT,
    city TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    
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
    duration_ms INTEGER,
    error TEXT
);

-- Indexes
CREATE INDEX idx_chat_logs_created_at ON chat_logs (created_at);
CREATE INDEX idx_chat_logs_session_id ON chat_logs (session_id);
CREATE INDEX idx_chat_logs_referrer ON chat_logs (referrer);

-- Comments
COMMENT ON TABLE chat_logs IS 'Stores chatbot conversations for user research and traffic analysis';
COMMENT ON COLUMN chat_logs.session_id IS 'Groups messages into conversations';
COMMENT ON COLUMN chat_logs.message_index IS 'Order of message within session (0, 1, 2...)';
