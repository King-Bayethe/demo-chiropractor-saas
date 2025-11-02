import { useState, useMemo } from 'react';
import { mockInvoices, Invoice } from '@/utils/mockData/mockInvoices';

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
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
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

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: String(Date.now()),
      invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const markAsPaid = (id: string) => {
    setInvoices(prev => prev.map(i =>
      i.id === id
        ? { ...i, status: 'paid', paidDate: new Date().toISOString() }
        : i
    ));
  };

  return {
    invoices: filteredInvoices,
    stats,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
  };
};
