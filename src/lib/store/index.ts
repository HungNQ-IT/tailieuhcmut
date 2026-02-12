import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Subject, Conversation, Notification } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: '1',
          email,
          name: 'Nguyen Van A',
          role: email.includes('admin') ? 'admin' : 'user',
          createdAt: new Date(),
        };
        
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      },
      
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: '1',
          email,
          name,
          role: 'user',
          createdAt: new Date(),
        };
        
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
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
  unreadCount: number;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: any) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  conversations: [],
  activeConversation: null,
  unreadCount: 0,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: message }
          : conv
      ),
    }));
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
