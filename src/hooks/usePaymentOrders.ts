import { useState, useMemo } from 'react';
import { mockPaymentOrders, PaymentOrder } from '@/utils/mockData/mockPaymentOrders';

export interface PaymentOrderStats {
  activePlans: number;
  monthlyRecurringRevenue: number;
  upcomingThisWeek: number;
  failedPayments: number;
}

export interface PaymentOrderFilters {
  search: string;
  status: string[];
  frequency: string[];
  dateRange?: { from?: Date; to?: Date };
}

export const usePaymentOrders = () => {
  const [paymentOrders] = useState<PaymentOrder[]>(mockPaymentOrders);
  const [filters, setFilters] = useState<PaymentOrderFilters>({
    search: '',
    status: [],
    frequency: [],
  });
  const [sortBy, setSortBy] = useState<'nextPayment' | 'amount' | 'patient' | 'status'>('nextPayment');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const calculateMRR = (order: PaymentOrder): number => {
    const { amount, frequency, customFrequencyDays } = order;
    
    switch (frequency) {
      case 'weekly':
        return amount * 4.33; // Average weeks per month
      case 'biweekly':
        return amount * 2.17; // Average bi-weeks per month
      case 'monthly':
        return amount;
      case 'custom':
        if (customFrequencyDays) {
          return (amount * 30) / customFrequencyDays;
        }
        return 0;
      default:
        return 0;
    }
  };

  const isUpcomingThisWeek = (date: string): boolean => {
    const nextPayment = new Date(date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return nextPayment >= today && nextPayment <= weekFromNow;
  };

  const filteredOrders = useMemo(() => {
    return paymentOrders.filter(order => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !order.patientName.toLowerCase().includes(searchLower) &&
          !order.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(order.status)) {
        return false;
      }

      // Frequency filter
      if (filters.frequency.length > 0 && !filters.frequency.includes(order.frequency)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const nextPayment = new Date(order.nextPaymentDate);
        if (filters.dateRange.from && nextPayment < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && nextPayment > filters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [paymentOrders, filters]);

  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'nextPayment':
          comparison = new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredOrders, sortBy, sortOrder]);

  const stats: PaymentOrderStats = useMemo(() => {
    const active = paymentOrders.filter(o => o.status === 'active');
    const mrr = active.reduce((sum, order) => sum + calculateMRR(order), 0);
    const upcoming = paymentOrders.filter(o => isUpcomingThisWeek(o.nextPaymentDate));
    const failed = paymentOrders.filter(o => o.status === 'failed');

    return {
      activePlans: active.length,
      monthlyRecurringRevenue: mrr,
      upcomingThisWeek: upcoming.length,
      failedPayments: failed.length,
    };
  }, [paymentOrders]);

  const getPaymentProgress = (order: PaymentOrder): number => {
    if (!order.totalPayments) return 0;
    return (order.paymentsMade / order.totalPayments) * 100;
  };

  return {
    paymentOrders: sortedOrders,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    stats,
    getPaymentProgress,
    calculateMRR,
    isUpcomingThisWeek,
  };
};
