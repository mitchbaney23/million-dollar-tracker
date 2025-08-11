import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '../components/CSVUpload';
import type { CategoriesData } from './categorization';
import { defaultCategories } from './categorization';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  currentAssets: number;
  goalAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Profile functions
export async function createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const userDoc = doc(db, 'users', uid);
  const profile: Omit<UserProfile, 'uid'> = {
    email,
    displayName,
    currentAssets: 0,
    goalAmount: 1000000,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  await setDoc(userDoc, profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = doc(db, 'users', uid);
  const docSnap = await getDoc(userDoc);
  
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDoc = doc(db, 'users', uid);
  await updateDoc(userDoc, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

// Categories functions
export async function getUserCategories(uid: string): Promise<CategoriesData> {
  const categoriesDoc = doc(db, 'users', uid, 'data', 'categories');
  const docSnap = await getDoc(categoriesDoc);
  
  if (docSnap.exists()) {
    return docSnap.data() as CategoriesData;
  }
  
  // Initialize with default categories if none exist
  await setDoc(categoriesDoc, defaultCategories);
  return defaultCategories;
}

export async function saveUserCategories(uid: string, categories: CategoriesData): Promise<void> {
  const categoriesDoc = doc(db, 'users', uid, 'data', 'categories');
  await setDoc(categoriesDoc, {
    ...categories,
    lastUpdated: Date.now()
  });
}

// Transactions functions
export async function saveTransactions(uid: string, transactions: Transaction[]): Promise<void> {
  const batch = transactions.map(async (transaction) => {
    const transactionDoc = doc(db, 'users', uid, 'transactions', transaction.id);
    await setDoc(transactionDoc, {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  });

  await Promise.all(batch);
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  const transactionsCollection = collection(db, 'users', uid, 'transactions');
  const q = query(transactionsCollection, orderBy('Date', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Transaction[];
}

export async function updateTransaction(uid: string, transactionId: string, updates: Partial<Transaction>): Promise<void> {
  const transactionDoc = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(transactionDoc, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deleteTransaction(uid: string, transactionId: string): Promise<void> {
  const transactionDoc = doc(db, 'users', uid, 'transactions', transactionId);
  await deleteDoc(transactionDoc);
}

// Batch update transactions
export async function updateMultipleTransactions(uid: string, updates: { id: string; category: string }[]): Promise<void> {
  const batch = updates.map(async ({ id, category }) => {
    const transactionDoc = doc(db, 'users', uid, 'transactions', id);
    await updateDoc(transactionDoc, {
      category,
      updatedAt: Timestamp.now()
    });
  });

  await Promise.all(batch);
}