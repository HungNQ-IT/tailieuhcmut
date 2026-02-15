'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, setUser } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from current session
    initAuth();

    // Listen for auth state changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url || undefined,
            role: session.user.user_metadata?.role || 'user',
            createdAt: new Date(session.user.created_at),
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initAuth, setUser]);

  return <>{children}</>;
}
