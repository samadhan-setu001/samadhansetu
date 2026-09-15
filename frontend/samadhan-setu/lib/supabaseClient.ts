import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True once real Supabase credentials are present in .env.local.
 * lib/api.ts checks this flag and transparently switches from the
 * in-memory mock store to real Supabase/PostgREST/Edge Function calls,
 * so the app is runnable before AND after you wire up the backend.
 */
export const HAS_SUPABASE = Boolean(url && anonKey);

// Only construct a real client when credentials exist — creating one with
// empty strings throws at import time and would break the mock-data mode.
export const supabase: SupabaseClient | null = HAS_SUPABASE
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;
