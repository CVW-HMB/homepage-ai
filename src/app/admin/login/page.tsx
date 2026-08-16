"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace(params.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-1">Conversation console</h1>
      <p className="text-sm text-zinc-500 mb-6">Private. Sign in to continue.</p>

      <label htmlFor="password" className="block text-sm text-zinc-400 mb-2">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
      />

      <button
        type="submit"
        disabled={loading || !password}
        className="mt-4 w-full px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? "Checking…" : "Sign in"}
      </button>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
