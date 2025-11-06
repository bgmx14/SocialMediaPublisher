import axios from 'axios';
import type {
  APIResponse,
  Post,
  PostFormData,
  SocialAccount,
  Media,
  PublicationHistory,
  AIGenerationRequest,
  Stats,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Accounts API
export const accountsApi = {
  getAll: () => api.get<APIResponse<SocialAccount[]>>('/accounts'),
  getById: (id: number) => api.get<APIResponse<SocialAccount>>(`/accounts/${id}`),
  getByPlatform: (platform: string) =>
    api.get<APIResponse<SocialAccount[]>>(`/accounts/platform/${platform}`),
  create: (data: Partial<SocialAccount>) => api.post<APIResponse<SocialAccount>>('/accounts', data),
  update: (id: number, data: Partial<SocialAccount>) =>
    api.put<APIResponse<SocialAccount>>(`/accounts/${id}`, data),
  delete: (id: number) => api.delete<APIResponse>(`/accounts/${id}`),
};

// Posts API
export const postsApi = {
  getAll: (status?: string) =>
    api.get<APIResponse<Post[]>>('/posts', { params: { status } }),
  getById: (id: number) => api.get<APIResponse<Post>>(`/posts/${id}`),
  getByDateRange: (start: string, end: string) =>
    api.get<APIResponse<Post[]>>('/posts/date-range', { params: { start, end } }),
  getStats: () => api.get<APIResponse<Stats>>('/posts/stats'),
  create: (data: PostFormData) => api.post<APIResponse<Post>>('/posts', data),
  update: (id: number, data: Partial<PostFormData>) =>
    api.put<APIResponse<Post>>(`/posts/${id}`, data),
  delete: (id: number) => api.delete<APIResponse>(`/posts/${id}`),
  publish: (id: number) => api.post<APIResponse>(`/posts/${id}/publish`),
};

// AI API
export const aiApi = {
  generateCaption: (data: AIGenerationRequest) =>
    api.post<APIResponse<{ caption: string }>>('/ai/generate-caption', data),
  enhanceContent: (content: string, platform?: string) =>
    api.post<APIResponse<{ content: string }>>('/ai/enhance-content', { content, platform }),
  generateHashtags: (content: string, count?: number) =>
    api.post<APIResponse<{ hashtags: string[] }>>('/ai/generate-hashtags', { content, count }),
};

// Media API
export const mediaApi = {
  getAll: () => api.get<APIResponse<Media[]>>('/media'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<APIResponse<Media>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id: number) => api.delete<APIResponse>(`/media/${id}`),
};

// History API
export const historyApi = {
  getAll: (limit?: number) =>
    api.get<APIResponse<PublicationHistory[]>>('/history', { params: { limit } }),
  getByPostId: (postId: number) =>
    api.get<APIResponse<PublicationHistory[]>>(`/history/post/${postId}`),
};

export default api;
