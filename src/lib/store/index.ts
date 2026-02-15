import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Conversation, Notification, Message } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function mapSupabaseUser(supaUser: any): User {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
    avatar: supaUser.user_metadata?.avatar_url || undefined,
    role: supaUser.user_metadata?.role || 'user',
    createdAt: new Date(supaUser.created_at),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          const user = mapSupabaseUser(data.user);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Đăng nhập thất bại'
          });
          throw error;
        }
      },

      loginWithGithub: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/`,
            },
          });

          if (error) throw error;
          // OAuth redirect will happen, so we don't set state here
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Đăng nhập GitHub thất bại'
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role: 'user',
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            const user = mapSupabaseUser(data.user);
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Đăng ký thất bại'
          });
          throw error;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      initAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = mapSupabaseUser(session.user);
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  sidebarHovered: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarHovered: (hovered: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  sidebarHovered: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<Message>;
  createConversation: (participantIds: string[]) => Promise<Conversation>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      conversations: state.conversations.map(conv =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message }
          : conv
      ),
    }));
  },

  fetchConversations: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations:conversation_id (
            id,
            created_at,
            updated_at,
            conversation_participants (
              user_id,
              profiles:user_id (
                id,
                name,
                avatar
              )
            ),
            messages (
              id,
              content,
              created_at,
              sender_id
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversations: Conversation[] = (data || []).map((item: any) => {
        const conv = item.conversations;
        const participants = (conv.conversation_participants || []).map((p: any) => ({
          id: p.profiles?.id || p.user_id,
          name: p.profiles?.name || 'Unknown',
          avatar: p.profiles?.avatar,
          email: '',
          role: 'user' as const,
          createdAt: new Date(),
        }));

        const lastMsg = conv.messages?.[conv.messages.length - 1];
        const lastMessage = lastMsg ? {
          id: lastMsg.id,
          content: lastMsg.content,
          conversationId: conv.id,
          sender: participants.find((p: User) => p.id === lastMsg.sender_id) || participants[0],
          createdAt: new Date(lastMsg.created_at),
        } : undefined;

        return {
          id: conv.id,
          participants,
          lastMessage,
          unreadCount: 0,
          updatedAt: new Date(conv.updated_at),
        };
      });

      set({ conversations });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          sender_id,
          profiles:sender_id (
            id,
            name,
            avatar
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        conversationId: msg.conversation_id,
        sender: {
          id: msg.profiles?.id || msg.sender_id,
          name: msg.profiles?.name || 'Unknown',
          avatar: msg.profiles?.avatar,
          email: '',
          role: 'user' as const,
          createdAt: new Date(),
        },
        createdAt: new Date(msg.created_at),
      }));

      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          conversation_id: conversationId,
          sender_id: user.id,
        })
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          sender_id,
          profiles:sender_id (
            id,
            name,
            avatar
          )
        `)
        .single();

      if (error) throw error;

      const profile = data.profiles?.[0];
      const message: Message = {
        id: data.id,
        content: data.content,
        conversationId: data.conversation_id,
        sender: {
          id: profile?.id || data.sender_id,
          name: profile?.name || 'Unknown',
          avatar: profile?.avatar,
          email: '',
          role: 'user' as const,
          createdAt: new Date(),
        },
        createdAt: new Date(data.created_at),
      };

      set((state) => ({
        messages: [...state.messages, message],
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: message }
            : conv
        ),
      }));

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  createConversation: async (participantIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const allParticipants = Array.from(new Set([...participantIds, user.id]));

      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const participantRecords = allParticipants.map(userId => ({
        conversation_id: conv.id,
        user_id: userId,
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participantRecords);

      if (partError) throw partError;

      // Fetch participant profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', allParticipants);

      const conversation: Conversation = {
        id: conv.id,
        participants: (profiles || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          email: '',
          role: 'user' as const,
          createdAt: new Date(),
        })),
        unreadCount: 0,
        updatedAt: new Date(conv.updated_at),
      };

      set((state) => ({
        conversations: [conversation, ...state.conversations],
        activeConversation: conversation,
      }));

      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  },
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));

// Re-export exercise store
export { useExerciseStore } from './exercise-store';
