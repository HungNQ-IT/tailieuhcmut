import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Conversation, Notification, Message } from '@/types';
import { authApi, conversationsApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
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
          const response = await authApi.login(email, password);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Đăng nhập thất bại' 
          });
          throw error;
        }
      },
      
      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(email, password, name);
          const { user, token } = response.data;
          
          localStorage.setItem('token', token);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.error || 'Đăng ký thất bại' 
          });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      initAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
          const response = await authApi.getMe();
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        }
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
  sendMessage: (conversationId: string, content: string) => Promise<void>;
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
      const response = await conversationsApi.getAll();
      set({ conversations: response.data });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },
  
  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true });
    try {
      const response = await conversationsApi.getMessages(conversationId);
      set({ messages: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoading: false });
    }
  },
  
  sendMessage: async (conversationId: string, content: string) => {
    try {
      const response = await conversationsApi.sendMessage(conversationId, content);
      const message = response.data;
      
      set((state) => ({
        messages: [...state.messages, message],
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: message }
            : conv
        ),
      }));
      
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
  
  createConversation: async (participantIds: string[]) => {
    try {
      const response = await conversationsApi.create(participantIds);
      const conversation = response.data;
      
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
