import { SocialAccount } from '../types';
import { getPlatformIcon, getPlatformColor, formatDate } from '../utils/helpers';
import { FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface AccountCardProps {
  account: SocialAccount;
  onDelete?: (accountId: number) => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Platform Icon */}
          <div className={`w-12 h-12 ${getPlatformColor(account.platform)} rounded-full flex items-center justify-center text-2xl`}>
            {getPlatformIcon(account.platform)}
          </div>

          {/* Account Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {account.account_name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 capitalize">{account.platform}</p>

            <div className="flex items-center gap-2">
              {account.is_active ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                  <FiCheckCircle className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
                  <FiXCircle className="w-3 h-3" />
                  Inactive
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Connected: {formatDate(account.created_at, 'PP')}
            </p>
          </div>
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove account"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
