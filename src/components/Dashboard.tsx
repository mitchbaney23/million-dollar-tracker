import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Charts from './Charts';
import CSVUpload, { Transaction } from './CSVUpload';
import { 
  getUserProfile, 
  getUserCategories, 
  getUserTransactions,
  saveTransactions,
  saveUserCategories,
  updateTransaction,
  createUserProfile
} from '../lib/firestore';
import { CategoriesData, categorizeTransactions } from '../lib/categorization';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoriesData | null>(null);
  const [currentAssets, setCurrentAssets] = useState(0);
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        // Get or create user profile
        let profile = await getUserProfile(currentUser.uid);
        if (!profile) {
          await createUserProfile(
            currentUser.uid, 
            currentUser.email || '', 
            currentUser.displayName || 'User'
          );
          profile = await getUserProfile(currentUser.uid);
        }

        if (profile) {
          setCurrentAssets(profile.currentAssets);
          setGoalAmount(profile.goalAmount);
        }

        // Load categories and transactions
        const [userCategories, userTransactions] = await Promise.all([
          getUserCategories(currentUser.uid),
          getUserTransactions(currentUser.uid)
        ]);

        setCategories(userCategories);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleTransactionsUploaded = async (newTransactions: Transaction[]) => {
    if (!currentUser || !categories) return;

    try {
      // Categorize the new transactions
      const categorizedTransactions = categorizeTransactions(newTransactions, categories);
      
      // Save to Firestore
      await saveTransactions(currentUser.uid, categorizedTransactions);
      
      // Update local state
      setTransactions(prev => [...categorizedTransactions, ...prev]);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

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
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, category } : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const uncategorizedCount = transactions.filter(t => t.category === 'Uncategorized').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Million Dollar Tracker</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CSV Upload */}
            <CSVUpload onTransactionsUploaded={handleTransactionsUploaded} />
            
            {/* Charts */}
            <Charts 
              transactions={transactions}
              currentAssets={currentAssets}
              goalAmount={goalAmount}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-semibold">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uncategorized</span>
                  <span className="font-semibold text-orange-600">{uncategorizedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Assets</span>
                  <span className="font-semibold text-green-600">${currentAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal</span>
                  <span className="font-semibold">${goalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Categorization Alert */}
            {uncategorizedCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      {uncategorizedCount} transactions need categorization
                    </h3>
                    <div className="mt-2">
                      <a
                        href="/categorize"
                        className="text-sm text-orange-800 underline hover:text-orange-900"
                      >
                        Categorize transactions →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/categorize"
                  className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Categorize Transactions
                </a>
                <button className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}