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

// Exercise Types
export interface Exercise {
  id: string;
  slug: string;
  subjectSlug: string;
  chapterNumber: number;
  exerciseNumber: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content: string;
  solution?: string;
  hints: string[];
  tags: string[];
  points: number;
  timeLimit?: number;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  subjectSlug: string;
  chapterNumber: number;
  title: string;
  description?: string;
  estimatedTime?: number;
  orderIndex?: number;
  documents?: Document[];
}

export interface UserProgress {
  id: string;
  userId: string;
  exerciseId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  attempts: number;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number;
}

export interface ExerciseSubmission {
  id: string;
  userId: string;
  exerciseId: string;
  content: string;
  language?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed?: number;
  testCasesTotal?: number;
  createdAt: Date;
}
