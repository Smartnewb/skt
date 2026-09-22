import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'server-only';

/**
 * Server-only Supabase client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS — every privileged DB
 * access must go through this client inside Route Handlers / Server
 * Components only. Never import from client components ('server-only'
 * throws if it ends up in a browser bundle).
 *
 * Transition period: if SUPABASE_SERVICE_ROLE_KEY is not configured yet,
 * falls back to the anon key and logs a warning.
 */

let cachedClient: SupabaseClient | null = null;

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  let key = serviceRoleKey;
  if (!key) {
    console.warn(
      '[supabaseServer] SUPABASE_SERVICE_ROLE_KEY is not set; ' +
        'falling back to the anon key (transition period only — set the service role key ASAP).'
    );
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
  if (!key) {
    throw new Error(
      'No Supabase key configured: set SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  cachedClient = createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
