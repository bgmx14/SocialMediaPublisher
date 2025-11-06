import { format, parseISO } from 'date-fns';
import { SocialPlatform, PostStatus } from '../types';

export function formatDate(date: string | Date, formatStr = 'PPp'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getPlatformIcon(platform: SocialPlatform): string {
  const icons: Record<SocialPlatform, string> = {
    instagram: '📷',
    facebook: '👍',
    twitter: '🐦',
    linkedin: '💼',
    tiktok: '🎵',
  };
  return icons[platform] || '📱';
}

export function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    tiktok: 'bg-black',
  };
  return colors[platform] || 'bg-gray-500';
}

export function getStatusColor(status: PostStatus): string {
  const colors: Record<PostStatus, string> = {
    draft: 'bg-gray-400',
    scheduled: 'bg-yellow-500',
    published: 'bg-green-500',
    failed: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-400';
}

export function getStatusTextColor(status: PostStatus): string {
  const colors: Record<PostStatus, string> = {
    draft: 'text-gray-700',
    scheduled: 'text-yellow-700',
    published: 'text-green-700',
    failed: 'text-red-700',
  };
  return colors[status] || 'text-gray-700';
}

export function getStatusBgColor(status: PostStatus): string {
  const colors: Record<PostStatus, string> = {
    draft: 'bg-gray-100',
    scheduled: 'bg-yellow-50',
    published: 'bg-green-50',
    failed: 'bg-red-50',
  };
  return colors[status] || 'bg-gray-100';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function parseJSON<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
