import { supabase } from './supabase';
import { Message, Conversation } from '@/types';

class SupabaseRealtimeService {
  private messageSubscriptions: Map<string, any> = new Map();
  private conversationSubscription: any = null;

  // Subscribe to messages in a conversation
  subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: Message) => void
  ) {
    // Unsubscribe from existing subscription for this conversation
    this.unsubscribeFromMessages(conversationId);

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch full message with profile
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
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
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
            onNewMessage(message);
          }
        }
      )
      .subscribe();

    this.messageSubscriptions.set(conversationId, subscription);
    return subscription;
  }

  // Unsubscribe from messages in a conversation
  unsubscribeFromMessages(conversationId: string) {
    const existingSub = this.messageSubscriptions.get(conversationId);
    if (existingSub) {
      existingSub.unsubscribe();
      this.messageSubscriptions.delete(conversationId);
    }
  }

  // Subscribe to conversation updates (new conversations, last message changes)
  subscribeToConversations(
    userId: string,
    onConversationUpdate: (conversation: Conversation) => void,
    onNewConversation: (conversation: Conversation) => void
  ) {
    this.unsubscribeFromConversations();

    this.conversationSubscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // New conversation created
            const { data, error } = await supabase
              .from('conversations')
              .select(`
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
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              const participants = (data.conversation_participants || []).map((p: any) => {
                const profile = p.profiles?.[0];
                return {
                  id: profile?.id || p.user_id,
                  name: profile?.name || 'Unknown',
                  avatar: profile?.avatar,
                  email: '',
                  role: 'user' as const,
                  createdAt: new Date(),
                };
              });

              const conversation: Conversation = {
                id: data.id,
                participants,
                unreadCount: 0,
                updatedAt: new Date(data.updated_at),
              };
              onNewConversation(conversation);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        async (payload) => {
          // Conversation updated (likely last_message changed)
          const { data, error } = await supabase
            .from('conversations')
            .select(`
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
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            const participants = (data.conversation_participants || []).map((p: any) => {
              const profile = p.profiles?.[0];
              return {
                id: profile?.id || p.user_id,
                name: profile?.name || 'Unknown',
                avatar: profile?.avatar,
                email: '',
                role: 'user' as const,
                createdAt: new Date(),
              };
            });

            const lastMsg = data.messages?.[data.messages.length - 1];
            const lastMessage = lastMsg ? {
              id: lastMsg.id,
              content: lastMsg.content,
              conversationId: data.id,
              sender: participants.find((p) => p.id === lastMsg.sender_id) || participants[0],
              createdAt: new Date(lastMsg.created_at),
            } : undefined;

            const conversation: Conversation = {
              id: data.id,
              participants,
              lastMessage,
              unreadCount: 0,
              updatedAt: new Date(data.updated_at),
            };
            onConversationUpdate(conversation);
          }
        }
      )
      .subscribe();

    return this.conversationSubscription;
  }

  // Unsubscribe from all conversations
  unsubscribeFromConversations() {
    if (this.conversationSubscription) {
      this.conversationSubscription.unsubscribe();
      this.conversationSubscription = null;
    }
  }

  // Cleanup all subscriptions
  cleanup() {
    this.messageSubscriptions.forEach((sub) => sub.unsubscribe());
    this.messageSubscriptions.clear();
    this.unsubscribeFromConversations();
  }
}

export const realtimeService = new SupabaseRealtimeService();
