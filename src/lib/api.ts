import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () =>
    api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string; avatar?: string }) =>
    api.patch(`/users/${id}`, data),
};

// Conversations API
export const conversationsApi = {
  getAll: () => api.get('/messages/conversations'),
  getMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}/messages`),
  create: (participantIds: string[]) =>
    api.post('/messages/conversations', { participantIds }),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/messages/conversations/${conversationId}/messages`, { content }),
};

// Subjects API
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getBySlug: (slug: string) => api.get(`/subjects/${slug}`),
};

// Documents API
export const documentsApi = {
  getAll: (params?: { subjectId?: string; chapterId?: string }) => api.get('/documents', { params }),
  getById: (id: string) => api.get(`/documents/${id}`),
  download: (id: string) => api.post(`/documents/${id}/download`),
};
