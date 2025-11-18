import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/utils/mockData/mockInvoices';
import { toast } from 'sonner';

export interface InvoiceFilters {
  search: string;
  status: string[];
  patientIds: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface InvoiceStats {
  totalRevenue: number;
  outstanding: number;
  paidThisMonth: number;
  overdueCount: number;
}

export const useInvoices = () => {
  const queryClient = useQueryClient();
  
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('date_issued', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        patientId: inv.patient_id,
        patientName: inv.patient_name,
        patientEmail: inv.patient_email,
        lineItems: (inv.line_items as Array<{id: string; description: string; quantity: number; unitPrice: number; total: number}>) || [],
        subtotal: inv.subtotal,
        taxRate: inv.tax_rate,
        taxAmount: inv.tax_amount,
        total: inv.total,
        dateIssued: inv.date_issued,
        dueDate: inv.due_date,
        paidDate: inv.paid_date,
        status: inv.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
        notes: inv.notes
      }));
    }
  });
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: [],
    patientIds: [],
  });
  const [sortBy, setSortBy] = useState<'invoiceNumber' | 'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate statistics
  const stats = useMemo((): InvoiceStats => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const outstandingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const outstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const paidThisMonth = invoices
      .filter(i => {
        if (i.status !== 'paid' || !i.paidDate) return false;
        const paidDate = new Date(i.paidDate);
        return paidDate >= firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdueInvoices = invoices.filter(i => {
      if (i.status === 'paid' || i.status === 'draft' || i.status === 'cancelled') return false;
      const dueDate = new Date(i.dueDate);
      return dueDate < today;
    });

    return {
      totalRevenue,
      outstanding,
      paidThisMonth,
      overdueCount: overdueInvoices.length,
    };
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber.toLowerCase().includes(search) ||
        i.patientName.toLowerCase().includes(search) ||
        i.lineItems.some(item => item.description.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(i => filters.status.includes(i.status));
    }

    // Patient filter
    if (filters.patientIds.length > 0) {
      result = result.filter(i => filters.patientIds.includes(i.patientId));
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(i => new Date(i.dateIssued) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter(i => new Date(i.dateIssued) <= filters.dateTo!);
    }

    // Amount range filter
    if (filters.amountMin !== undefined) {
      result = result.filter(i => i.total >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      result = result.filter(i => i.total <= filters.amountMax!);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'invoiceNumber':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'date':
          comparison = new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime();
          break;
        case 'amount':
          comparison = a.total - b.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [invoices, filters, sortBy, sortOrder]);

  const addInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'dateIssued'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          patient_id: invoice.patientId,
          patient_name: invoice.patientName,
          patient_email: invoice.patientEmail,
          line_items: invoice.lineItems,
          subtotal: invoice.subtotal,
          tax_rate: invoice.taxRate,
          tax_amount: invoice.taxAmount,
          total: invoice.total,
          due_date: invoice.dueDate,
          paid_date: invoice.paidDate,
          status: invoice.status,
          notes: invoice.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created');
    },
    onError: () => {
      toast.error('Failed to create invoice');
    }
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          patient_id: updates.patientId,
          patient_name: updates.patientName,
          patient_email: updates.patientEmail,
          line_items: updates.lineItems,
          subtotal: updates.subtotal,
          tax_rate: updates.taxRate,
          tax_amount: updates.taxAmount,
          total: updates.total,
          due_date: updates.dueDate,
          paid_date: updates.paidDate,
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated');
    },
    onError: () => {
      toast.error('Failed to update invoice');
    }
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    }
  });

  const markAsPaid = (id: string) => {
    updateInvoice.mutate({ 
      id, 
      updates: { 
        status: 'paid' as const, 
        paidDate: new Date().toISOString() 
      } 
    });
  };

  return {
    invoices: filteredInvoices,
    isLoading,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addInvoice: addInvoice.mutate,
    updateInvoice: (id: string, updates: Partial<Invoice>) => updateInvoice.mutate({ id, updates }),
    deleteInvoice: deleteInvoice.mutate,
    markAsPaid,
  };
};
