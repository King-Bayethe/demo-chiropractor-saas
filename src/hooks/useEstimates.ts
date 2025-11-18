import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/utils/mockData/mockEstimates';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ['estimates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('date_created', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(est => ({
        id: est.id,
        estimateNumber: est.estimate_number,
        patientId: est.patient_id,
        patientName: est.patient_name,
        treatmentType: est.treatment_type,
        phases: (est.phases as Array<{id: string; name: string; description: string; sessions: number; pricePerSession: number; total: number}>) || [],
        subtotal: est.subtotal,
        discount: est.discount,
        total: est.total,
        dateCreated: est.date_created,
        validUntil: est.valid_until,
        status: est.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
        notes: est.notes
      }));
    }
  });
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

  const addEstimate = useMutation({
    mutationFn: async (estimate: Omit<Estimate, 'id' | 'estimateNumber' | 'dateCreated'>) => {
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          estimate_number: `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          patient_id: estimate.patientId,
          patient_name: estimate.patientName,
          treatment_type: estimate.treatmentType,
          phases: estimate.phases,
          subtotal: estimate.subtotal,
          discount: estimate.discount,
          total: estimate.total,
          valid_until: estimate.validUntil,
          status: estimate.status,
          notes: estimate.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate created');
    },
    onError: () => {
      toast.error('Failed to create estimate');
    }
  });

  const updateEstimate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Estimate> }) => {
      const { data, error } = await supabase
        .from('estimates')
        .update({
          patient_id: updates.patientId,
          patient_name: updates.patientName,
          treatment_type: updates.treatmentType,
          phases: updates.phases,
          subtotal: updates.subtotal,
          discount: updates.discount,
          total: updates.total,
          valid_until: updates.validUntil,
          status: updates.status,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate updated');
    },
    onError: () => {
      toast.error('Failed to update estimate');
    }
  });

  const deleteEstimate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      toast.success('Estimate deleted');
    },
    onError: () => {
      toast.error('Failed to delete estimate');
    }
  });

  return {
    estimates: filteredEstimates,
    isLoading,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addEstimate: addEstimate.mutate,
    updateEstimate: (id: string, updates: Partial<Estimate>) => updateEstimate.mutate({ id, updates }),
    deleteEstimate: deleteEstimate.mutate,
  };
};
