'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore, useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils';
import { realtimeService } from '@/lib/supabase-realtime';
import { Message } from '@/types';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    addMessage,
    setConversations,
  } = useChatStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Supabase Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to conversation updates (new conversations, last message changes)
    realtimeService.subscribeToConversations(
      user.id,
      (updatedConversation) => {
        // Update existing conversation
        setConversations(
          conversations.map((conv) =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
        );
      },
      (newConversation) => {
        // Add new conversation
        setConversations([newConversation, ...conversations]);
      }
    );

    return () => {
      realtimeService.cleanup();
    };
  }, [user, conversations, setConversations]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConversation || !user) return;

    // Subscribe to new messages in this conversation
    realtimeService.subscribeToMessages(
      activeConversation.id,
      (message: Message) => {
        // Only add message if it's not from current user (avoid duplicates)
        if (message.sender.id !== user.id) {
          addMessage(message);
        }
      }
    );

    return () => {
      realtimeService.unsubscribeFromMessages(activeConversation.id);
    };
  }, [activeConversation, user, addMessage]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(
    (conv: any) => {
      const otherParticipant = conv.participants.find(
        (p: any) => p.id !== user?.id
      );
      
      if (!otherParticipant) return false;
      
      return (
        otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      await sendMessage(activeConversation.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tin nhắn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation: any) => {
              const otherParticipant = getOtherParticipant(conversation);
              if (!otherParticipant) return null;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    activeConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {otherParticipant.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage
                          ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt))
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                      {getOtherParticipant(activeConversation)?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getOtherParticipant(activeConversation)?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center">Đang tải tin nhắn...</div>
                ) : (
                  messages.map((message: any) => {
                    const isMe = message.sender.id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          isMe ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          )}
                        >
                          <p>{message.content}</p>
                          <span
                            className={cn(
                              'text-xs mt-1 block',
                              isMe ? 'text-blue-200' : 'text-gray-500'
                            )}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Nhập tin nhắn..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chọn ngườ dùng từ danh sách để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
