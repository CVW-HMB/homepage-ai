import { getSupabase } from "@/lib/supabase";

// chat_logs stores one row per message. The console works in conversations, so
// the per-session rollup lives in the `chat_sessions` view (sql/chat_sessions.sql)
// — aggregating in Postgres is what makes "10 per page, newest first" a real
// paginated query rather than a fetch-everything-and-group-in-JS.

export const PAGE_SIZE = 10;

export interface ConversationSummary {
  session_id: string;
  started_at: string;
  last_at: string;
  message_count: number;
  total_tokens: number | null;
  error_count: number;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  utm_source: string | null;
  user_agent: string | null;
  first_message: string | null;
}

export interface ConversationTurn {
  message_index: number;
  created_at: string;
  user_message: string;
  assistant_response: string | null;
  model: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
  error: string | null;
}

export interface ConversationDetail extends ConversationSummary {
  ip_address: string | null;
  language: string | null;
  page_url: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  turns: ConversationTurn[];
}

export interface ConversationPage {
  conversations: ConversationSummary[];
  total: number;
  page: number;
  pageCount: number;
}

// Errors are returned rather than thrown so the console can render a diagnostic
// instead of a 500 — an unreachable database is the most likely failure here.
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function describe(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) return String(err.message);
  return String(err);
}

export async function listConversations(page: number): Promise<Result<ConversationPage>> {
  const current = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (current - 1) * PAGE_SIZE;

  try {
    const { data, count, error } = await getSupabase()
      .from("chat_sessions")
      .select("*", { count: "exact" })
      .order("last_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { ok: false, error: error.message };

    const total = count ?? 0;
    return {
      ok: true,
      data: {
        conversations: (data ?? []) as ConversationSummary[],
        total,
        page: current,
        pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
    };
  } catch (err) {
    return { ok: false, error: describe(err) };
  }
}

export async function getConversation(sessionId: string): Promise<Result<ConversationDetail>> {
  try {
    const { data, error } = await getSupabase()
      .from("chat_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("message_index", { ascending: true });

    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: "Conversation not found" };

    const first = data[0];
    const turns: ConversationTurn[] = data.map((row) => ({
      message_index: row.message_index,
      created_at: row.created_at,
      user_message: row.user_message,
      assistant_response: row.assistant_response,
      model: row.model,
      tokens_used: row.tokens_used,
      duration_ms: row.duration_ms,
      error: row.error,
    }));

    return {
      ok: true,
      data: {
        session_id: sessionId,
        started_at: first.created_at,
        last_at: data[data.length - 1].created_at,
        message_count: data.length,
        total_tokens: data.reduce((sum, r) => sum + (r.tokens_used ?? 0), 0),
        error_count: data.filter((r) => r.error).length,
        country: first.country,
        region: first.region,
        city: first.city,
        referrer: first.referrer,
        utm_source: first.utm_source,
        utm_medium: first.utm_medium,
        utm_campaign: first.utm_campaign,
        user_agent: first.user_agent,
        ip_address: first.ip_address,
        language: first.language,
        page_url: first.page_url,
        first_message: first.user_message,
        turns,
      },
    };
  } catch (err) {
    return { ok: false, error: describe(err) };
  }
}

export function formatLocation(c: {
  city: string | null;
  region: string | null;
  country: string | null;
}): string {
  const parts = [c.city, c.region, c.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}

export function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (!Number.isFinite(ms) || ms < 1000) return "<1s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
