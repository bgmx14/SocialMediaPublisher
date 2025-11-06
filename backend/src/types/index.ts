export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type MediaType = 'image' | 'video' | 'carousel';

export interface SocialAccount {
  id: number;
  platform: SocialPlatform;
  account_name: string;
  account_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  media_urls?: string;
  media_type?: MediaType;
  scheduled_at?: string;
  published_at?: string;
  status: PostStatus;
  platforms: string;
  account_ids: string;
  ai_generated: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  type: MediaType;
  created_at: string;
}

export interface AIGenerationRequest {
  prompt?: string;
  context?: string;
  platform?: SocialPlatform;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  max_length?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PublishRequest {
  postId: number;
  platforms: SocialPlatform[];
  accountIds: number[];
  immediate?: boolean;
}

export interface ScheduleStats {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  failed: number;
}
