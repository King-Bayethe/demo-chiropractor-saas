import { useState, useMemo } from 'react';
import { mockTransactions, Transaction } from '@/utils/mockData/mockTransactions';

export interface TransactionStats {
  totalIncome: number;
  totalRefunds: number;
  netRevenue: number;
  transactionVolume: number;
}

export interface TransactionFilters {
  search: string;
  type: string[];
  paymentMethod: string[];
  dateRange?: { from?: Date; to?: Date };
  amountRange?: { min?: number; max?: number };
  patientIds: string[];
}

export const useTransactions = () => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: [],
    paymentMethod: [],
    patientIds: [],
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'patient' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filterByDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    const from = new Date();

    switch (preset) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(today.getFullYear() - 1);
        break;
    }

    setFilters(prev => ({ ...prev, dateRange: { from, to: today } }));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !transaction.patientId.toLowerCase().includes(searchLower) &&
          !transaction.transactionNumber.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(transaction.type)) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(transaction.paymentMethod)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const transactionDate = new Date(transaction.date);
        if (filters.dateRange.from && transactionDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && transactionDate > filters.dateRange.to) {
          return false;
        }
      }

      // Amount range filter
      if (filters.amountRange?.min !== undefined && Math.abs(transaction.amount) < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange?.max !== undefined && Math.abs(transaction.amount) > filters.amountRange.max) {
        return false;
      }

      // Patient filter
      if (filters.patientIds.length > 0 && !filters.patientIds.includes(transaction.patientId)) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'patient':
          comparison = a.patientId.localeCompare(b.patientId);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTransactions, sortBy, sortOrder]);

  const stats: TransactionStats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= thisMonth);

    const income = monthlyTransactions
      .filter(t => t.type === 'payment' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const refunds = monthlyTransactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalIncome: income,
      totalRefunds: refunds,
      netRevenue: income - refunds,
      transactionVolume: monthlyTransactions.length,
    };
  }, [transactions]);

  const getTransactionsByType = () => {
    return transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    transactions: sortedTransactions,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    stats,
    filterByDatePreset,
    getTransactionsByType,
  };
};
