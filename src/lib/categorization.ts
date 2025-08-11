import type { Transaction } from '../components/CSVUpload';

export interface CategoryRule {
  keywords: string[];
  category: 'Essentials' | 'Investments' | 'Unnecessary Spending';
}

export interface CategoriesData {
  rules: CategoryRule[];
  lastUpdated: number;
}

export const defaultCategories: CategoriesData = {
  rules: [
    // Essentials
    { keywords: ['grocery', 'supermarket', 'food', 'gas', 'fuel', 'pharmacy', 'medical', 'doctor', 'insurance', 'rent', 'mortgage', 'utilities', 'electric', 'water', 'internet', 'phone'], category: 'Essentials' },
    
    // Investments
    { keywords: ['investment', 'stock', 'bond', 'mutual fund', 'etf', '401k', 'retirement', 'savings', 'deposit'], category: 'Investments' },
    
    // Unnecessary Spending
    { keywords: ['starbucks', 'coffee', 'restaurant', 'dining', 'entertainment', 'movie', 'streaming', 'spotify', 'netflix', 'amazon', 'shopping', 'retail', 'clothing', 'jewelry'], category: 'Unnecessary Spending' }
  ],
  lastUpdated: Date.now()
};

export function categorizeTransaction(transaction: Transaction, categories: CategoriesData): Transaction {
  const description = transaction.Description.toLowerCase();
  
  for (const rule of categories.rules) {
    for (const keyword of rule.keywords) {
      if (description.includes(keyword.toLowerCase())) {
        return {
          ...transaction,
          category: rule.category
        };
      }
    }
  }
  
  return {
    ...transaction,
    category: 'Uncategorized'
  };
}

export function addCategoryRule(
  categories: CategoriesData,
  merchant: string,
  category: 'Essentials' | 'Investments' | 'Unnecessary Spending'
): CategoriesData {
  const merchantKeyword = merchant.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
  const existingRule = categories.rules.find(rule => rule.category === category);
  
  if (existingRule) {
    if (!existingRule.keywords.includes(merchantKeyword)) {
      existingRule.keywords.push(merchantKeyword);
    }
  } else {
    categories.rules.push({
      keywords: [merchantKeyword],
      category
    });
  }
  
  return {
    ...categories,
    lastUpdated: Date.now()
  };
}

export function categorizeTransactions(transactions: Transaction[], categories: CategoriesData): Transaction[] {
  return transactions.map(transaction => categorizeTransaction(transaction, categories));
}