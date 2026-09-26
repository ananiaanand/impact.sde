import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const mockSupabaseAuth = {
  getSession: async () => ({ data: { session: null } }),
  onAuthStateChange: (_callback: (event: string, session: any) => void) => ({
    data: { subscription: { unsubscribe: () => undefined } },
  }),
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    if (email === 'teacher@gmail.com' && password === 'teacher') {
      return { data: { user: { email }, session: { user: { email } } }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid login credentials.' } };
  },
  signUp: async ({ email, password }: { email: string; password: string }) => {
    if (!email || !password) {
      return { data: { user: null, session: null }, error: { message: 'Email and password are required.' } };
    }
    return { data: { user: { email }, session: { user: { email } } }, error: null };
  },
  signOut: async () => ({ error: null }),
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({ auth: mockSupabaseAuth } as any);
