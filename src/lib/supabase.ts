import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: return mock client
    return null;
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️  Supabase environment variables are missing!');
      return null;
    }
    
    try {
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }
  
  return supabaseInstance;
}

// Export for backward compatibility
export const supabase = getSupabaseClient();
