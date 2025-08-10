import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Transaction } from './CSVUpload';

interface ChartsProps {
  transactions: Transaction[];
  currentAssets: number;
  goalAmount: number;
}

const COLORS = {
  'Essentials': '#10B981',
  'Investments': '#3B82F6', 
  'Unnecessary Spending': '#EF4444',
  'Uncategorized': '#9CA3AF'
};

export default function Charts({ transactions, currentAssets = 10000, goalAmount = 1000000 }: ChartsProps) {
  const progressPercentage = Math.min((currentAssets / goalAmount) * 100, 100);

  const categoryData = useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized';
      const amount = Math.abs(transaction.Amount);
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const monthlySpending = transactions.reduce((acc, transaction) => {
      if (transaction.category === 'Unnecessary Spending') {
        const date = new Date(transaction.Date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + Math.abs(transaction.Amount);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        spending: Math.round(amount),
        target: 500 // Example target
      }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress to $1M Goal</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Current Assets</span>
          <span className="font-medium">${currentAssets.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>$0</span>
          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          <span>$1,000,000</span>
        </div>
      </div>

      {/* Spending by Category Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Uncategorized} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No spending data available
          </div>
        )}
      </div>

      {/* Monthly Unnecessary Spending vs Target */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Unnecessary Spending vs Target</h3>
        {monthlyData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value}`, name === 'spending' ? 'Actual' : 'Target']} />
                <Line 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Actual Spending"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No unnecessary spending data available
          </div>
        )}
      </div>

      {/* Category Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryData.map((category) => (
            <div key={category.name} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[category.name as keyof typeof COLORS] || COLORS.Uncategorized }}
                ></div>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">${category.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}