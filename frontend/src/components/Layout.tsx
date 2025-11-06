import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiPlus, FiUsers, FiClock, FiBarChart2 } from 'react-icons/fi';

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Create Post', path: '/create', icon: FiPlus },
    { name: 'Calendar', path: '/calendar', icon: FiCalendar },
    { name: 'History', path: '/history', icon: FiClock },
    { name: 'Accounts', path: '/accounts', icon: FiUsers },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary-600">
              Social Publisher
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Social Media Publisher v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
