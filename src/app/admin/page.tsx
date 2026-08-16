import { listConversations } from "@/lib/conversations";
import AdminConsole from "@/components/AdminConsole";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Conversation console",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const result = await listConversations(Number(page ?? "1"));

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Conversation console</h1>
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
            <p className="font-semibold text-red-300 mb-2">Can&apos;t reach the conversation log</p>
            <p className="text-sm text-zinc-300 font-mono break-words">{result.error}</p>
          </div>
          <div className="mt-6 text-sm text-zinc-400 space-y-2">
            <p>Usual causes, in order of likelihood:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                The Supabase project is paused or deleted — check that the host in{" "}
                <code className="text-zinc-300">SUPABASE_URL</code> still resolves.
              </li>
              <li>
                <code className="text-zinc-300">SUPABASE_URL</code> or{" "}
                <code className="text-zinc-300">SUPABASE_SERVICE_KEY</code> is missing from the
                environment.
              </li>
              <li>
                The <code className="text-zinc-300">chat_sessions</code> view hasn&apos;t been
                created — run <code className="text-zinc-300">sql/chat_sessions.sql</code>.
              </li>
            </ul>
          </div>
        </div>
      </main>
    );
  }

  return <AdminConsole initial={result.data} />;
}
