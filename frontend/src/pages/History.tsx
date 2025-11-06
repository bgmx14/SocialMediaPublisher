import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../services/api';
import { formatDate } from '../utils/helpers';
import { FiCheckCircle, FiXCircle, FiExternalLink } from 'react-icons/fi';

export default function History() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await historyApi.getAll(100);
      return res.data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Publication History</h1>
        <p className="text-gray-600">View all your published posts across platforms</p>
      </div>

      {/* History List */}
      {history && history.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.post_title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">{item.platform}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.account_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 badge bg-green-100 text-green-800">
                          <FiCheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 badge bg-red-100 text-red-800">
                          <FiXCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(item.published_at, 'PPp')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.platform_url ? (
                        <a
                          href={item.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">No publication history yet</p>
        </div>
      )}
    </div>
  );
}
