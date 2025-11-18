import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentOrder } from '@/utils/mockData/mockPaymentOrders';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  
  const { data: paymentOrders = [], isLoading } = useQuery({
    queryKey: ['payment-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .order('next_payment_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform snake_case to camelCase
      return (data || []).map(order => ({
        id: order.id,
        patientId: order.patient_id,
        patientName: order.patient_name,
        description: order.description,
        amount: order.amount,
        frequency: order.frequency as 'weekly' | 'biweekly' | 'monthly' | 'custom',
        customFrequencyDays: order.custom_frequency_days,
        startDate: order.start_date,
        endDate: order.end_date,
        totalPayments: order.total_payments,
        paymentsMade: order.payments_made,
        nextPaymentDate: order.next_payment_date,
        lastPaymentDate: order.last_payment_date,
        status: order.status as 'active' | 'paused' | 'completed' | 'cancelled' | 'failed',
        paymentMethod: order.payment_method,
        autoProcess: order.auto_process,
        paymentHistory: (order.payment_history as Array<{date: string; amount: number; status: 'success' | 'failed' | 'pending'}>) || []
      }));
    }
  });
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
    if (!date) return false;
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
