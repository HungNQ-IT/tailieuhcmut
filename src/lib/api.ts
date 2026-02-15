import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Supabase auth token to requests (for backend routes that still need it)
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Users API (still uses backend for now)
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: { name?: string; avatar?: string }) =>
    api.patch(`/users/${id}`, data),
};

// Subjects API (still uses backend)
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getBySlug: (slug: string) => api.get(`/subjects/${slug}`),
};

// Documents API (still uses backend)
export const documentsApi = {
  getAll: (params?: { subjectId?: string; chapterId?: string }) => api.get('/documents', { params }),
  getById: (id: string) => api.get(`/documents/${id}`),
  download: (id: string) => api.post(`/documents/${id}/download`),
};
