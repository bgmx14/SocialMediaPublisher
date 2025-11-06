import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi, accountsApi, aiApi } from '../services/api';
import { SocialPlatform, PostFormData } from '../types';
import MediaUpload from '../components/MediaUpload';
import { FiSave, FiSend, FiCalendar, FiZap } from 'react-icons/fi';
import { getPlatformIcon } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    media_urls: [],
    scheduled_at: '',
    status: 'draft',
    platforms: [],
    account_ids: [],
  });

  const [aiLoading, setAiLoading] = useState(false);

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      return res.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PostFormData) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created successfully!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create post');
    },
  });

  const handleSubmit = (status: 'draft' | 'scheduled') => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    if (status === 'scheduled' && !formData.scheduled_at) {
      toast.error('Please select a date and time for scheduling');
      return;
    }

    if (formData.platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    createMutation.mutate({ ...formData, status });
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const isSelected = formData.platforms.includes(platform);
    const platformAccounts = accounts?.filter((a) => a.platform === platform) || [];

    if (isSelected) {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter((p) => p !== platform),
        account_ids: formData.account_ids.filter((id) => !platformAccounts.some((a) => a.id === id)),
      });
    } else {
      if (platformAccounts.length === 0) {
        toast.error(`No ${platform} account connected`);
        return;
      }
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platform],
        account_ids: [...formData.account_ids, platformAccounts[0].id],
      });
    }
  };

  const handleGenerateCaption = async () => {
    if (!formData.title && !formData.content) {
      toast.error('Please provide a title or some context');
      return;
    }

    setAiLoading(true);
    const toastId = toast.loading('Generating caption with AI...');

    try {
      const res = await aiApi.generateCaption({
        prompt: formData.title,
        context: formData.content || undefined,
        platform: formData.platforms[0],
      });
      setFormData({ ...formData, content: res.data.data?.caption || '', ai_generated: true });
      toast.success('Caption generated!', { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate caption', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const platforms: SocialPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
        <p className="text-gray-600">Create and schedule your social media content</p>
      </div>

      <div className="card space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            placeholder="Enter post title..."
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <button
              onClick={handleGenerateCaption}
              disabled={aiLoading}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <FiZap className="w-4 h-4" />
              Generate with AI
            </button>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="textarea"
            rows={8}
            placeholder="Write your post content..."
          />
          <p className="text-sm text-gray-500 mt-1">{formData.content.length} characters</p>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Images/Videos)
          </label>
          <MediaUpload
            onUploadComplete={(urls) => setFormData({ ...formData, media_urls: urls })}
          />
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platforms *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const isSelected = formData.platforms.includes(platform);
              const hasAccount = accounts?.some((a) => a.platform === platform);
              return (
                <button
                  key={platform}
                  onClick={() => handlePlatformToggle(platform)}
                  disabled={!hasAccount}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : hasAccount
                      ? 'border-gray-200 hover:border-primary-300'
                      : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl mb-2">{getPlatformIcon(platform)}</div>
                  <p className="text-sm font-medium capitalize">{platform}</p>
                  {!hasAccount && <p className="text-xs text-red-600 mt-1">Not connected</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            className="input"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={createMutation.isPending}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('scheduled')}
            disabled={createMutation.isPending || !formData.scheduled_at}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiCalendar className="w-4 h-4" />
            {formData.scheduled_at ? 'Schedule Post' : 'Select Date to Schedule'}
          </button>
          <button
            onClick={() => navigate('/')}
            disabled={createMutation.isPending}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
