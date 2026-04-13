import { createContext, useContext } from 'react';
import { Family, AidType, HistoryRecord, Transaction, InventoryItem } from './types';

export const MOCK_FAMILIES: Family[] = [];

export const AID_STATS_COLORS = {
  [AidType.FoodBasket]: '#f97316',
  [AidType.Clothes]: '#EAB308',
  [AidType.Medicine]: '#14b8a6',
  [AidType.Gas]: '#ef4444',
  [AidType.Financial]: '#22c55e',
  [AidType.Spiritual]: '#a855f7',
  [AidType.Other]: '#64748b'
};

export interface AppContextType {
  families: Family[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  error: string | null;
  addFamily: (family: Family) => void;
  updateFamily: (family: Family) => Promise<void>;
  removeFamily: (id: string) => void;
  addHistoryRecord: (familyId: string, record: HistoryRecord) => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addInventoryItem: (item: InventoryItem) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  removeInventoryItem: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, isDanger?: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};