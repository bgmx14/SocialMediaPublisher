import { Post } from '../types';
import { formatDate, getPlatformIcon, getStatusColor, parseJSON, truncateText } from '../utils/helpers';
import { FiEdit, FiTrash2, FiSend, FiClock } from 'react-icons/fi';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
  onPublish?: (postId: number) => void;
}

export default function PostCard({ post, onEdit, onDelete, onPublish }: PostCardProps) {
  const platforms = parseJSON<string[]>(post.platforms, []);
  const mediaUrls = parseJSON<string[]>(post.media_urls || '[]', []);

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`badge ${getStatusColor(post.status)} text-white`}>
              {post.status}
            </span>
            {post.ai_generated && (
              <span className="badge bg-purple-100 text-purple-700">AI Generated</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(post)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit"
            >
              <FiEdit className="w-4 h-4" />
            </button>
          )}
          {onPublish && post.status === 'draft' && (
            <button
              onClick={() => onPublish(post.id)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Publish now"
            >
              <FiSend className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
        {truncateText(post.content, 200)}
      </p>

      {/* Media preview */}
      {mediaUrls.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {mediaUrls.slice(0, 3).map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Media ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ))}
          {mediaUrls.length > 3 && (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-medium">
              +{mediaUrls.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Platforms */}
      {platforms.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Platforms:</span>
          <div className="flex gap-1">
            {platforms.map((platform) => (
              <span key={platform} className="text-lg" title={platform}>
                {getPlatformIcon(platform as any)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
        {post.scheduled_at ? (
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            <span>Scheduled: {formatDate(post.scheduled_at, 'PPp')}</span>
          </div>
        ) : (
          <span>Created: {formatDate(post.created_at, 'PPp')}</span>
        )}
        {post.published_at && (
          <span>Published: {formatDate(post.published_at, 'PPp')}</span>
        )}
      </div>

      {/* Error message */}
      {post.error_message && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {post.error_message}
        </div>
      )}
    </div>
  );
}
