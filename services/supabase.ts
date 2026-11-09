import { createClient } from '@supabase/supabase-js';

// Supabase project (recreated 2026-11-09 after the old project was deleted).
// The anon key is a PUBLIC key by design — it ships in the website's code
// and is safe to keep here. The old Vercel env vars still point at the
// deleted project, so the values below take precedence until those are
// updated in the Vercel dashboard.
const FALLBACK_SUPABASE_URL = 'https://ybwsrjpcnxhgbfuzryjp.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_JlIva16OZ5PyfxA17Sm_Rg_v_7h0CAU';

const supabaseUrl = FALLBACK_SUPABASE_URL;
const supabaseAnonKey = FALLBACK_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep this loud in development so auth misconfiguration is obvious.
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
