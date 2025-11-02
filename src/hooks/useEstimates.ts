import { useState, useMemo } from 'react';
import { mockEstimates, Estimate } from '@/utils/mockData/mockEstimates';

export interface EstimateFilters {
  search: string;
  status: string[];
  treatmentType: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
}

export interface EstimateStats {
  totalEstimates: number;
  pendingReview: number;
  acceptanceRate: number;
  estimatedRevenue: number;
}

export const useEstimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>(mockEstimates);
  const [filters, setFilters] = useState<EstimateFilters>({
    search: '',
    status: [],
    treatmentType: [],
  });
  const [sortBy, setSortBy] = useState<'dateCreated' | 'total' | 'patientName' | 'status'>('dateCreated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate statistics
  const stats = useMemo((): EstimateStats => {
    const totalEstimates = estimates.length;
    const pendingReview = estimates.filter(e => e.status === 'sent').length;
    const accepted = estimates.filter(e => e.status === 'accepted').length;
    const acceptanceRate = estimates.length > 0 ? (accepted / estimates.length) * 100 : 0;
    const estimatedRevenue = estimates
      .filter(e => e.status === 'accepted')
      .reduce((sum, e) => sum + e.total, 0);

    return {
      totalEstimates,
      pendingReview,
      acceptanceRate,
      estimatedRevenue,
    };
  }, [estimates]);

  // Filter estimates
  const filteredEstimates = useMemo(() => {
    let result = [...estimates];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(e => 
        e.estimateNumber.toLowerCase().includes(search) ||
        e.patientName.toLowerCase().includes(search) ||
        e.treatmentType.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(e => filters.status.includes(e.status));
    }

    // Treatment type filter
    if (filters.treatmentType.length > 0) {
      result = result.filter(e => filters.treatmentType.includes(e.treatmentType));
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(e => new Date(e.dateCreated) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter(e => new Date(e.dateCreated) <= filters.dateTo!);
    }

    // Amount range filter
    if (filters.amountFrom !== undefined) {
      result = result.filter(e => e.total >= filters.amountFrom!);
    }
    if (filters.amountTo !== undefined) {
      result = result.filter(e => e.total <= filters.amountTo!);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dateCreated':
          comparison = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'patientName':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [estimates, filters, sortBy, sortOrder]);

  const addEstimate = (estimate: Omit<Estimate, 'id' | 'estimateNumber' | 'dateCreated'>) => {
    const newEstimate: Estimate = {
      ...estimate,
      id: String(Date.now()),
      estimateNumber: `EST-${new Date().getFullYear()}-${String(estimates.length + 1).padStart(3, '0')}`,
      dateCreated: new Date().toISOString(),
    };
    setEstimates(prev => [...prev, newEstimate]);
  };

  const updateEstimate = (id: string, updates: Partial<Estimate>) => {
    setEstimates(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEstimate = (id: string) => {
    setEstimates(prev => prev.filter(e => e.id !== id));
  };

  return {
    estimates: filteredEstimates,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addEstimate,
    updateEstimate,
    deleteEstimate,
  };
};
