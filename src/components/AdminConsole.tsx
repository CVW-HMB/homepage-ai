"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ConversationDetail,
  ConversationPage,
  ConversationSummary,
} from "@/lib/conversations";
import { formatDuration, formatLocation } from "@/lib/conversations";

function shortTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function deviceOf(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  if (/iPhone|Android.*Mobile/i.test(userAgent)) return "Mobile";
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  return "Desktop";
}

function sourceOf(c: { referrer: string | null; utm_source: string | null }): string {
  if (c.utm_source) return c.utm_source;
  if (!c.referrer) return "Direct";
  try {
    return new URL(c.referrer).hostname.replace(/^www\./, "");
  } catch {
    return c.referrer;
  }
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200 break-words">{value || "—"}</dd>
    </div>
  );
}

export default function AdminConsole({
  initial,
  health,
}: {
  initial: ConversationPage;
  health: { lastAt: string | null; staleDays: number };
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { conversations, total, page, pageCount } = initial;

  const open = async (sessionId: string) => {
    setLoadingId(sessionId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/conversation/${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load conversation");
      setSelected(data as ConversationDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setLoadingId(null);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Conversation console</h1>
          <p className="text-xs text-zinc-500">
            {total} conversation{total === 1 ? "" : "s"} · newest first
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* A silent logging failure once went unnoticed for three months. Say so. */}
      {health.staleDays >= 2 && (
        <div className="border-b border-amber-900 bg-amber-950/40 px-6 py-3 text-sm text-amber-200">
          <strong className="font-semibold">Logging may be broken.</strong>{" "}
          {health.lastAt
            ? `No conversation has been recorded for ${health.staleDays} days (last: ${new Date(
                health.lastAt
              ).toLocaleDateString()}).`
            : "No conversations have ever been recorded."}{" "}
          Check that SUPABASE_URL and SUPABASE_SERVICE_KEY are set in the deployment and that
          chat_logs has every column the app writes.
        </div>
      )}

      <div className="grid lg:grid-cols-[380px_1fr] gap-0 lg:h-[calc(100vh-73px)]">
        {/* Picker: fixed-height scroll window so the transcript pane stays put */}
        <aside className="border-r border-zinc-800 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="p-6 text-sm text-zinc-500">
                No conversations logged yet. Once visitors use the chat widget they&apos;ll appear
                here.
              </p>
            )}

            <ul className="divide-y divide-zinc-900">
              {conversations.map((c: ConversationSummary) => {
                const active = selected?.session_id === c.session_id;
                return (
                  <li key={c.session_id}>
                    <div className={`p-4 ${active ? "bg-zinc-900" : "hover:bg-zinc-950"}`}>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {formatLocation(c)}
                        </span>
                        <span className="text-xs text-zinc-500 shrink-0">
                          {shortTime(c.last_at)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mb-2">
                        {c.message_count} msg{c.message_count === 1 ? "" : "s"} ·{" "}
                        {formatDuration(c.started_at, c.last_at)} · {deviceOf(c.user_agent)} ·{" "}
                        {sourceOf(c)}
                        {c.error_count > 0 && (
                          <span className="text-amber-400"> · {c.error_count} flagged</span>
                        )}
                      </p>

                      {c.first_message && (
                        <p className="text-xs text-zinc-500 italic line-clamp-2 mb-3">
                          &ldquo;{c.first_message}&rdquo;
                        </p>
                      )}

                      <button
                        onClick={() => open(c.session_id)}
                        disabled={loadingId === c.session_id}
                        className="text-xs px-3 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {loadingId === c.session_id ? "Opening…" : active ? "Reopen" : "Open"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 10 per page — links, so a page is shareable and reloadable */}
          <nav className="border-t border-zinc-800 p-3 flex items-center justify-between text-sm">
            <a
              href={`/admin?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={
                page <= 1
                  ? "pointer-events-none text-zinc-700"
                  : "text-zinc-300 hover:text-white transition-colors"
              }
            >
              ← Newer
            </a>
            <span className="text-zinc-500">
              Page {page} of {pageCount}
            </span>
            <a
              href={`/admin?page=${page + 1}`}
              aria-disabled={page >= pageCount}
              className={
                page >= pageCount
                  ? "pointer-events-none text-zinc-700"
                  : "text-zinc-300 hover:text-white transition-colors"
              }
            >
              Older →
            </a>
          </nav>
        </aside>

        {/* Transcript + who it was */}
        <section className="overflow-y-auto p-6">
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {!selected && !error && (
            <p className="text-sm text-zinc-500">
              Pick a conversation on the left to rebuild the full transcript.
            </p>
          )}

          {selected && (
            <div className="max-w-3xl">
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mb-6 border-b border-zinc-800">
                <Field label="Location" value={formatLocation(selected)} />
                <Field label="Source" value={sourceOf(selected)} />
                <Field label="Device" value={deviceOf(selected.user_agent)} />
                <Field label="Language" value={selected.language} />
                <Field label="Started" value={new Date(selected.started_at).toLocaleString()} />
                <Field
                  label="Length"
                  value={`${selected.message_count} msgs · ${formatDuration(
                    selected.started_at,
                    selected.last_at
                  )}`}
                />
                <Field
                  label="Tokens"
                  value={selected.total_tokens ? String(selected.total_tokens) : null}
                />
                <Field label="Network" value={selected.ip_address} />
                <Field label="Landing page" value={selected.page_url} />
                <Field label="Referrer" value={selected.referrer} />
                <Field label="UTM medium" value={selected.utm_medium} />
                <Field label="UTM campaign" value={selected.utm_campaign} />
              </dl>

              <div className="space-y-4">
                {selected.turns.map((turn) => (
                  <div key={turn.message_index} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-4 py-2 rounded-lg bg-white text-black">
                        {turn.user_message}
                      </div>
                    </div>

                    {turn.assistant_response && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2 rounded-lg bg-zinc-800 text-gray-200">
                          {turn.assistant_response}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-zinc-600 text-right">
                      {new Date(turn.created_at).toLocaleTimeString()}
                      {turn.duration_ms != null && ` · ${turn.duration_ms}ms`}
                      {turn.tokens_used != null && ` · ${turn.tokens_used} tok`}
                      {turn.error && (
                        <span className="text-amber-500"> · {turn.error.slice(0, 60)}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
