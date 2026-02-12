export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  category: 'cs' | 'general';
  description: string;
  icon: string;
  color: string;
  chapters: Chapter[];
  documentCount: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  documents: Document[];
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'slide' | 'text';
  url: string;
  size?: string;
  uploadedAt: Date;
  uploadedBy: User;
  downloads: number;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  conversationId: string;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'message' | 'system' | 'document';
  read: boolean;
  createdAt: Date;
}
