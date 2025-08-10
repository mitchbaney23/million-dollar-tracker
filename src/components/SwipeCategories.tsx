import React, { useState, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import { Transaction } from './CSVUpload';
import { CategoriesData, addCategoryRule } from '../lib/categorization';

interface SwipeCategoriesProps {
  transactions: Transaction[];
  categories: CategoriesData;
  onCategoriesUpdate: (categories: CategoriesData) => void;
  onTransactionCategorized: (transactionId: string, category: string) => void;
}

export default function SwipeCategories({ 
  transactions, 
  categories, 
  onCategoriesUpdate, 
  onTransactionCategorized 
}: SwipeCategoriesProps) {
  const uncategorizedTransactions = useMemo(() => 
    transactions.filter(t => t.category === 'Uncategorized'),
    [transactions]
  );

  const [currentIndex, setCurrentIndex] = useState(uncategorizedTransactions.length - 1);
  const [lastDirection, setLastDirection] = useState<string>('');

  const swiped = (direction: string, transaction: Transaction) => {
    const category = direction === 'left' ? 'Unnecessary Spending' : 'Essentials';
    
    // Update categories with the new rule
    const updatedCategories = addCategoryRule(categories, transaction.Description, category);
    onCategoriesUpdate(updatedCategories);
    
    // Update transaction category
    onTransactionCategorized(transaction.id, category);
    
    setLastDirection(direction);
    setCurrentIndex(currentIndex - 1);
  };

  const outOfFrame = (name: string) => {
    console.log(name + ' left the screen!');
  };

  if (uncategorizedTransactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">All transactions categorized!</h3>
          <p className="mt-1 text-sm text-gray-500">Great job! All your transactions have been categorized.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Categorize Transactions</h2>
          <p className="text-gray-600">
            {uncategorizedTransactions.length - currentIndex - 1} / {uncategorizedTransactions.length} completed
          </p>
          <div className="mt-4 flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-red-500">← Swipe Left</div>
              <div className="text-sm text-gray-500">Unnecessary</div>
            </div>
            <div className="text-center">
              <div className="text-green-500">Swipe Right →</div>
              <div className="text-sm text-gray-500">Essential</div>
            </div>
          </div>
        </div>

        <div className="relative h-96">
          {uncategorizedTransactions.map((transaction, index) => (
            <TinderCard
              key={transaction.id}
              onSwipe={(dir) => swiped(dir, transaction)}
              onCardLeftScreen={() => outOfFrame(transaction.id)}
              preventSwipe={['up', 'down']}
              className="absolute inset-0"
            >
              <div className="bg-white rounded-lg shadow-lg h-full flex flex-col justify-center p-6 cursor-grab active:cursor-grabbing">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {transaction.Description}
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    ${Math.abs(transaction.Amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.Date}
                  </p>
                </div>
                
                <div className="mt-6 flex justify-between text-sm">
                  <div className="text-red-500 flex items-center">
                    <span className="mr-1">←</span>
                    Unnecessary
                  </div>
                  <div className="text-green-500 flex items-center">
                    Essential
                    <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))}
        </div>

        {lastDirection && (
          <div className="text-center mt-4 text-sm text-gray-600">
            Last swipe: {lastDirection === 'left' ? 'Unnecessary Spending' : 'Essential'}
          </div>
        )}
      </div>
    </div>
  );
}