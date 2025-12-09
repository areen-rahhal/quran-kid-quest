import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables - app will not function properly');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ set' : '✗ missing');
  console.error('Please ensure environment variables are configured before starting the dev server');
} else {
  console.log('✓ Supabase environment variables loaded successfully');
  console.log('✓ Supabase URL:', supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
