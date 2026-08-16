import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only. SUPABASE_SERVICE_KEY bypasses row-level security, so this module
// must never be imported from a "use client" component — doing so would inline
// the key into the browser bundle. Everything that touches it (the chat route's
// logger and the /admin console) runs server-side.

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        // There is no end-user auth here — one service credential, used from the
        // server. Persisting or refreshing a session would only create state to
        // leak between requests on a warm serverless instance.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabase;
}
