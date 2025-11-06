import { useQuery } from '@tanstack/react-query';
import { postsApi, accountsApi } from '../services/api';
import { FiTrendingUp, FiUsers, FiCalendar, FiActivity } from 'react-icons/fi';

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['posts', 'stats'],
    queryFn: async () => {
      const res = await postsApi.getStats();
      return res.data.data;
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      return res.data.data || [];
    },
  });

  const platformCounts = accounts?.reduce((acc: any, account) => {
    acc[account.platform] = (acc[account.platform] || 0) + 1;
    return acc;
  }, {});

  const analyticsCards = [
    {
      title: 'Total Posts',
      value: stats?.total || 0,
      icon: FiActivity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All time posts created',
    },
    {
      title: 'Success Rate',
      value: stats?.total ? `${Math.round((stats.published / stats.total) * 100)}%` : '0%',
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Posts published successfully',
    },
    {
      title: 'Connected Accounts',
      value: accounts?.length || 0,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Active social media accounts',
    },
    {
      title: 'Scheduled',
      value: stats?.scheduled || 0,
      icon: FiCalendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Posts waiting to be published',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your social media publishing performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgColor} ${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-sm font-medium text-gray-700 mb-1">{card.title}</p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Platform Distribution */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Distribution</h2>
        <div className="space-y-4">
          {Object.entries(platformCounts || {}).map(([platform, count]: [string, any]) => {
            const percentage = (count / (accounts?.length || 1)) * 100;
            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{platform}</span>
                  <span className="text-sm text-gray-600">{count} account(s)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {(!platformCounts || Object.keys(platformCounts).length === 0) && (
            <p className="text-center text-gray-500 py-8">No platforms connected yet</p>
          )}
        </div>
      </div>

      {/* Post Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Post Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Draft</span>
              <span className="text-lg font-bold text-gray-900">{stats?.draft || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">Scheduled</span>
              <span className="text-lg font-bold text-yellow-900">{stats?.scheduled || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Published</span>
              <span className="text-lg font-bold text-green-900">{stats?.published || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-700">Failed</span>
              <span className="text-lg font-bold text-red-900">{stats?.failed || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Total Posts</span>
              <span className="text-lg font-bold text-gray-900">{stats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Published Posts</span>
              <span className="text-lg font-bold text-green-600">{stats?.published || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Pending Posts</span>
              <span className="text-lg font-bold text-yellow-600">
                {(stats?.draft || 0) + (stats?.scheduled || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Accounts</span>
              <span className="text-lg font-bold text-primary-600">
                {accounts?.filter((a) => a.is_active).length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
