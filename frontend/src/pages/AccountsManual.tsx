import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../services/api';
import AccountCard from '../components/AccountCard';
import { SocialPlatform } from '../types';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Accounts() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: '' as SocialPlatform,
    account_name: '',
    account_id: '',
    access_token: '',
  });

  const { data: accounts } = useQuery({
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

  const addMutation = useMutation({
    mutationFn: (data: any) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account connected successfully');
      setShowAddModal(false);
      setNewAccount({
        platform: '' as SocialPlatform,
        account_name: '',
        account_id: '',
        access_token: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to connect account');
    },
  });

  const handleAddAccount = () => {
    if (!newAccount.platform || !newAccount.account_name || !newAccount.account_id || !newAccount.access_token) {
      toast.error('Please fill in all fields');
      return;
    }
    addMutation.mutate(newAccount);
  };

  const handleDelete = (accountId: number) => {
    if (confirm('Are you sure you want to remove this account?')) {
      deleteMutation.mutate(accountId);
    }
  };

  const platforms: SocialPlatform[] = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected Accounts</h1>
          <p className="text-gray-600">Manage your social media accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      {accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No accounts connected yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Connect Your First Account
          </button>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Account</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value as SocialPlatform })}
                  className="input"
                >
                  <option value="">Select platform</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform} className="capitalize">
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                  className="input"
                  placeholder="e.g., @mycompany"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID *
                </label>
                <input
                  type="text"
                  value={newAccount.account_id}
                  onChange={(e) => setNewAccount({ ...newAccount, account_id: e.target.value })}
                  className="input"
                  placeholder="Platform-specific ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token *
                </label>
                <textarea
                  value={newAccount.access_token}
                  onChange={(e) => setNewAccount({ ...newAccount, access_token: e.target.value })}
                  className="textarea"
                  rows={3}
                  placeholder="Paste your access token here"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAccount}
                disabled={addMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Account'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addMutation.isPending}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To get your access token, visit your platform's developer portal and create an app.
                For production use, implement proper OAuth flows.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
