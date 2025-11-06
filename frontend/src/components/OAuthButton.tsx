import { SocialPlatform } from '../types';
import { getPlatformIcon, getPlatformColor } from '../utils/helpers';

interface OAuthButtonProps {
  platform: SocialPlatform;
  onConnect: (platform: SocialPlatform) => void;
  disabled?: boolean;
}

export default function OAuthButton({ platform, onConnect, disabled }: OAuthButtonProps) {
  const platformNames: Record<SocialPlatform, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter / X',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
  };

  const platformDescriptions: Record<SocialPlatform, string> = {
    instagram: 'Connect your Instagram Business account',
    facebook: 'Connect your Facebook Pages',
    twitter: 'Connect your Twitter / X account',
    linkedin: 'Connect your LinkedIn profile',
    tiktok: 'Connect your TikTok account',
  };

  return (
    <button
      onClick={() => onConnect(platform)}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-primary-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:shadow-none`}
    >
      <div className="flex items-start gap-4">
        {/* Platform Icon */}
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-3xl ${getPlatformColor(platform)}`}>
          {getPlatformIcon(platform)}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {platformNames[platform]}
          </h3>
          <p className="mb-3 text-sm text-gray-600">
            {platformDescriptions[platform]}
          </p>

          {/* Connect Button */}
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-primary-700">
              Connect Account
            </div>
            <svg
              className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-50 to-primary-100 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
