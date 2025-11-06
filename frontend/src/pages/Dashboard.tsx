import { useQuery } from '@tanstack/react-query';
import { postsApi, accountsApi } from '../services/api';
import PostCard from '../components/PostCard';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['posts', 'stats'],
    queryFn: async () => {
      const res = await postsApi.getStats();
      return res.data.data;
    },
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['posts', 'recent'],
    queryFn: async () => {
      const res = await postsApi.getAll();
      return res.data.data?.slice(0, 6) || [];
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await accountsApi.getAll();
      return res.data.data || [];
    },
  });

  const handlePublish = async (postId: number) => {
    const toastId = toast.loading('Publishing post...');
    try {
      await postsApi.publish(postId);
      toast.success('Post published successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish post', { id: toastId });
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const toastId = toast.loading('Deleting post...');
    try {
      await postsApi.delete(postId);
      toast.success('Post deleted successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post', { id: toastId });
    }
  };

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.total || 0,
      icon: FiTrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Scheduled',
      value: stats?.scheduled || 0,
      icon: FiClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Published',
      value: stats?.published || 0,
      icon: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Failed',
      value: stats?.failed || 0,
      icon: FiAlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your social media content in one place</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Accounts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
          <button
            onClick={() => navigate('/accounts')}
            className="btn btn-secondary text-sm"
          >
            Manage
          </button>
        </div>
        {accounts && accounts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
              >
                <span className="capitalize font-medium">{account.platform}</span>
                <span className="text-sm text-gray-600">({account.account_name})</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No accounts connected yet</p>
            <button
              onClick={() => navigate('/accounts')}
              className="btn btn-primary"
            >
              Connect Account
            </button>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
          <button
            onClick={() => navigate('/create')}
            className="btn btn-primary"
          >
            Create New Post
          </button>
        </div>
        {recentPosts && recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={(post) => navigate(`/edit/${post.id}`)}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No posts yet</p>
            <button
              onClick={() => navigate('/create')}
              className="btn btn-primary"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
