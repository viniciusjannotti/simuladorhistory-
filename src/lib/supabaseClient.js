import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);

const isReady = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE';

export const supabase = isReady ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
    console.warn('Supabase client NOT initialized. Possible reasons:');
    console.warn('- Missing environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    console.warn('- Environment variables not configured in Vercel settings');
    console.log('Detected URL:', supabaseUrl);
    console.log('Has Key:', !!supabaseAnonKey);
}
