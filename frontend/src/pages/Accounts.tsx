import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { accountsApi } from '../services/api';
import AccountCard from '../components/AccountCard';
import OAuthButton from '../components/OAuthButton';
import { SocialPlatform } from '../types';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Accounts() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for OAuth callback parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const count = searchParams.get('count');

    if (success === 'true') {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });

      const message = count
        ? `Successfully connected ${count} account(s)!`
        : 'Account connected successfully!';

      toast.success(message);

      // Clear URL parameters
      setSearchParams({});
    }

    if (error) {
      toast.error(decodeURIComponent(error));
      setSearchParams({});
    }
  }, [searchParams, queryClient, setSearchParams]);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      return res.data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove account');
    },
  });

  const handleConnectPlatform = (platform: SocialPlatform) => {
    // Redirect to backend OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/oauth/${platform}/authorize`;
  };

  const handleDelete = (accountId: number) => {
    if (confirm('Are you sure you want to remove this account?')) {
      deleteMutation.mutate(accountId);
    }
  };

  const platforms: SocialPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];
  const connectedPlatforms = new Set(accounts?.map(a => a.platform) || []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Accounts</h1>
        <p className="text-gray-600">Connect your social media accounts to start publishing</p>
      </div>

      {/* OAuth Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Secure OAuth Connection</h3>
          <p className="text-sm text-blue-800">
            Click on a platform below to securely connect your account. You'll be redirected to the platform's
            authorization page where you can grant permissions. Your credentials are never stored directly.
          </p>
        </div>
      </div>

      {/* Connected Accounts */}
      {accounts && accounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Connected Accounts ({accounts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Connect New Accounts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {accounts && accounts.length > 0 ? 'Add More Accounts' : 'Connect Your First Account'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <OAuthButton
              key={platform}
              platform={platform}
              onConnect={handleConnectPlatform}
              disabled={false}
            />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">Instagram & Facebook:</strong>
            <p>You'll need a Facebook Business account and an Instagram Business account linked to a Facebook Page.</p>
          </div>
          <div>
            <strong className="text-gray-900">Twitter / X:</strong>
            <p>Make sure you have a Twitter Developer account and have created an app with OAuth 2.0 enabled.</p>
          </div>
          <div>
            <strong className="text-gray-900">LinkedIn:</strong>
            <p>You'll need a LinkedIn Developer app with the Marketing Developer Platform access.</p>
          </div>
        </div>
      </div>

      {/* Developer Setup Warning */}
      {accounts?.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Developer Setup Required</h3>
            <p className="text-sm text-yellow-800 mb-2">
              Before connecting accounts, make sure you've configured the API credentials in your backend <code className="bg-yellow-100 px-1 rounded">.env</code> file:
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Facebook/Instagram: <code className="bg-yellow-100 px-1 rounded">FACEBOOK_APP_ID</code> and <code className="bg-yellow-100 px-1 rounded">FACEBOOK_APP_SECRET</code></li>
              <li>Twitter: <code className="bg-yellow-100 px-1 rounded">TWITTER_API_KEY</code> and <code className="bg-yellow-100 px-1 rounded">TWITTER_API_SECRET</code></li>
              <li>LinkedIn: <code className="bg-yellow-100 px-1 rounded">LINKEDIN_CLIENT_ID</code> and <code className="bg-yellow-100 px-1 rounded">LINKEDIN_CLIENT_SECRET</code></li>
            </ul>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading accounts...</div>
        </div>
      )}
    </div>
  );
}
