'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    name: 'Nguyễn Văn B',
    avatar: 'NB',
    lastMessage: 'Cảm ơn bạn đã chia sẻ tài liệu!',
    time: '5 phút',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Trần Thị C',
    avatar: 'TC',
    lastMessage: 'Bạn có tài liệu môn Cấu trúc dữ liệu không?',
    time: '30 phút',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Admin',
    avatar: 'AD',
    lastMessage: 'Hệ thống sẽ bảo trì vào tối nay.',
    time: '2 giờ',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    name: 'Lê Văn D',
    avatar: 'LD',
    lastMessage: 'Cảm ơn!',
    time: '1 ngày',
    unread: 0,
    online: false,
  },
];

// Mock messages data
const mockMessages = [
  {
    id: '1',
    sender: 'other',
    content: 'Chào bạn, bạn có thể giúp mình về bài tập môn Lập trình C được không?',
    time: '10:30',
  },
  {
    id: '2',
    sender: 'me',
    content: 'Chào bạn! Mình có thể giúp gì cho bạn?',
    time: '10:32',
  },
  {
    id: '3',
    sender: 'other',
    content: 'Mình đang gặp khó khăn ở bài tập con trỏ, bạn có tài liệu nào về phần này không?',
    time: '10:35',
  },
  {
    id: '4',
    sender: 'me',
    content: 'Có nha! Mình sẽ gửi bài giảng và bài tập mẫu cho bạn.',
    time: '10:36',
  },
  {
    id: '5',
    sender: 'me',
    content: '[Tài liệu: Pointer_C_Programming.pdf]',
    time: '10:36',
    isFile: true,
  },
  {
    id: '6',
    sender: 'other',
    content: 'Cảm ơn bạn đã chia sẻ tài liệu!',
    time: '10:40',
  },
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    setNewMessage('');
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
            {filteredConversations.map((conversation) => (
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
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conversation.name}
                    </p>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
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
                      {activeConversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {activeConversation.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activeConversation.name}</p>
                  <p className="text-sm text-gray-500">
                    {activeConversation.online ? 'Đang hoạt động' : 'Không hoạt động'}
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
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        message.sender === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      )}
                    >
                      {message.isFile ? (
                        <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm">{message.content}</span>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <span
                        className={cn(
                          'text-xs mt-1 block',
                          message.sender === 'me' ? 'text-blue-200' : 'text-gray-500'
                        )}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
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
