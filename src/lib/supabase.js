import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const looksLikePlaceholder = (v) => !v || v.includes('YOUR-') || v.includes('YOUR_');

export const isConfigured = !looksLikePlaceholder(url) && !looksLikePlaceholder(anonKey);

// Only the public anon key is used in the browser, and there is no sign-in:
// auth sessions and token refreshes are switched off so the app makes no auth requests.
// The tables are locked by Row Level Security; the app can only call the room-code
// protected functions in supabase/schema.sql.
export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;
