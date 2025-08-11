import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import SwipeCategories from './components/SwipeCategories';
import Navigation from './components/Navigation';
import type { Transaction } from './components/CSVUpload';
import type { CategoriesData } from './lib/categorization';
import { 
  getUserCategories, 
  getUserTransactions,
  saveUserCategories,
  updateTransaction
} from './lib/firestore';

function MainApp() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'categorize'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoriesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        const [userCategories, userTransactions] = await Promise.all([
          getUserCategories(currentUser.uid),
          getUserTransactions(currentUser.uid)
        ]);

        setCategories(userCategories);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleCategoriesUpdate = async (newCategories: CategoriesData) => {
    if (!currentUser) return;

    try {
      await saveUserCategories(currentUser.uid, newCategories);
      setCategories(newCategories);
    } catch (error) {
      console.error('Error updating categories:', error);
    }
  };

  const handleTransactionCategorized = async (transactionId: string, category: string) => {
    if (!currentUser) return;

    try {
      await updateTransaction(currentUser.uid, transactionId, { category });
      
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, category } : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'categorize' && categories && (
          <SwipeCategories
            transactions={transactions}
            categories={categories}
            onCategoriesUpdate={handleCategoriesUpdate}
            onTransactionCategorized={handleTransactionCategorized}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
