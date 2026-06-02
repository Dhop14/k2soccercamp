// Server-side Supabase clients — never import from client components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function serverSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
}

function serverAnonKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Anon/publishable client for server reads allowed by RLS (e.g. public status RPC). */
export function getSupabaseServerAnon(): SupabaseClient<Database> | null {
  const url = serverSupabaseUrl();
  const key = serverAnonKey();
  if (!url || !key) {
    return null;
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _supabaseAdmin: SupabaseClient<Database> | null | undefined;

/** Service role client for trusted writes. Returns null if not configured. */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (_supabaseAdmin !== undefined) {
    return _supabaseAdmin;
  }

  const url = serverSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    const missing = [
      ...(!url ? ["SUPABASE_URL or VITE_SUPABASE_URL"] : []),
      ...(!serviceKey ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    console.warn(
      `[Supabase] Admin client unavailable (${missing.join(", ")}). Registration submit will not work until configured.`,
    );
    _supabaseAdmin = null;
    return null;
  }

  _supabaseAdmin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabaseAdmin;
}

/** @deprecated Prefer getSupabaseAdmin() — throws if used when null */
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop, receiver) {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new Error(
        "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
      );
    }
    return Reflect.get(client, prop, receiver);
  },
});
