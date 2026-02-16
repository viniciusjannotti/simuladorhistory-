import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);

const isReady = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE';

export const supabase = isReady ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
    console.warn('Supabase client NOT initialized. Persistence disabled.');
}
