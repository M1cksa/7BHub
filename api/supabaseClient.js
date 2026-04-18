import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY fehlt. Bitte .env aus .env.example anlegen.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const functionsBaseUrl =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
  (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');
