import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
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

// Export a proxy object that works on both server and client
export const supabase = {
  auth: {
    signInWithPassword: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not initialized');
      return client.auth.signInWithPassword(...args);
    },
    signUp: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not initialized');
      return client.auth.signUp(...args);
    },
    signOut: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not initialized');
      return client.auth.signOut(...args);
    },
    getUser: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) return { data: { user: null }, error: null };
      return client.auth.getUser(...args);
    },
    getSession: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) return { data: { session: null }, error: null };
      return client.auth.getSession(...args);
    },
    onAuthStateChange: (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
      return client.auth.onAuthStateChange(...args);
    },
    signInWithOAuth: async (...args: any[]) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not initialized');
      return client.auth.signInWithOAuth(...args);
    },
  },
  from: (table: string) => {
    const client = getSupabaseClient();
    if (!client) {
      // Return a mock query builder that does nothing on server
      return {
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: () => ({ data: null, error: null }),
        order: () => ({ data: null, error: null }),
        single: () => ({ data: null, error: null }),
      };
    }
    return client.from(table);
  },
  channel: (name: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        on: () => ({ subscribe: () => ({}) }),
      };
    }
    return client.channel(name);
  },
};
