import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: 'dashboard' | 'categorize';
  onPageChange: (page: 'dashboard' | 'categorize') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Million Dollar Tracker</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => onPageChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'dashboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onPageChange('categorize')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'categorize'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Categorize
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {currentUser?.displayName}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}