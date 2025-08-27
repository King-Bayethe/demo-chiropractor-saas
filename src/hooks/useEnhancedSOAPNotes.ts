import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSOAPNotes, SOAPNote } from './useSOAPNotes';
import { SearchFilters } from '@/components/soap/SOAPNoteSearch';
import { subDays, subMonths, subYears, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UseEnhancedSOAPNotesProps {
  patientId?: string;
  pageSize?: number;
}

interface PaginationState {
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export function useEnhancedSOAPNotes({ 
  patientId, 
  pageSize = 20 
}: UseEnhancedSOAPNotesProps = {}) {
  const { toast } = useToast();
  const { 
    soapNotes, 
    loading, 
    error, 
    fetchSOAPNotes, 
    deleteSOAPNote: basedeleteSOAPNote,
    createSOAPNote,
    updateSOAPNote,
    getSOAPNote
  } = useSOAPNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [allNotes, setAllNotes] = useState<SOAPNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    let notes = patientId 
      ? soapNotes.filter(note => note.patient_id === patientId)
      : soapNotes;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(note => 
        note.chief_complaint?.toLowerCase().includes(query) ||
        note.provider_name?.toLowerCase().includes(query) ||
        (typeof note.subjective_data === 'object' && 
         JSON.stringify(note.subjective_data).toLowerCase().includes(query)) ||
        (typeof note.objective_data === 'object' && 
         JSON.stringify(note.objective_data).toLowerCase().includes(query)) ||
        (typeof note.assessment_data === 'object' && 
         JSON.stringify(note.assessment_data).toLowerCase().includes(query)) ||
        (typeof note.plan_data === 'object' && 
         JSON.stringify(note.plan_data).toLowerCase().includes(query))
      );
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate = subDays(now, 7);
          break;
        case 'month':
          cutoffDate = subDays(now, 30);
          break;
        case 'quarter':
          cutoffDate = subMonths(now, 3);
          break;
        case 'year':
          cutoffDate = subYears(now, 1);
          break;
        default:
          cutoffDate = new Date(0); // Beginning of time
      }
      
      notes = notes.filter(note => 
        isAfter(new Date(note.date_of_service), cutoffDate)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'draft') {
        notes = notes.filter(note => note.is_draft);
      } else if (filters.status === 'complete') {
        notes = notes.filter(note => !note.is_draft);
      }
    }

    // Apply provider filter
    if (filters.provider) {
      notes = notes.filter(note => 
        note.provider_name?.toLowerCase().includes(filters.provider!.toLowerCase())
      );
    }

    return notes.sort((a, b) => 
      new Date(b.date_of_service).getTime() - new Date(a.date_of_service).getTime()
    );
  }, [soapNotes, patientId, searchQuery, filters]);

  // Paginated notes for display
  const paginatedNotes = useMemo(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    return filteredNotes.slice(startIndex, endIndex);
  }, [filteredNotes, currentPage, pageSize]);

  // Pagination state
  const paginationState: PaginationState = useMemo(() => {
    const totalItems = filteredNotes.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasMore = (currentPage + 1) * pageSize < totalItems;

    return {
      page: currentPage,
      totalPages,
      totalItems,
      hasMore
    };
  }, [filteredNotes.length, currentPage, pageSize]);

  // Load initial data
  useEffect(() => {
    if (isInitialLoad) {
      loadNotes();
      setIsInitialLoad(false);
    }
  }, [patientId, isInitialLoad]);

  // Load notes function
  const loadNotes = useCallback(async (options?: { reset?: boolean }) => {
    try {
      await fetchSOAPNotes({ 
        patientId,
        limit: 1000, // Get all notes for client-side filtering
        offset: 0,
        search: ''
      });
    } catch (error) {
      console.error('Failed to load SOAP notes:', error);
    }
  }, [fetchSOAPNotes, patientId]);

  // Load more notes (pagination)
  const loadMore = useCallback(() => {
    if (paginationState.hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationState.hasMore, loading]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page
    setSelectedNotes([]); // Clear selection
  }, []);

  // Filter functionality
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page
    setSelectedNotes([]); // Clear selection
  }, []);

  // Selection functionality
  const handleSelectionChange = useCallback((noteIds: string[]) => {
    setSelectedNotes(noteIds);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedNotes(paginatedNotes.map(note => note.id));
  }, [paginatedNotes]);

  const clearSelection = useCallback(() => {
    setSelectedNotes([]);
  }, []);

  // Bulk operations
  const bulkDelete = useCallback(async (noteIds: string[]) => {
    try {
      const deletePromises = noteIds.map(id => basedeleteSOAPNote(id));
      const results = await Promise.allSettled(deletePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        toast({
          title: "Success",
          description: `Successfully deleted ${successful} SOAP note${successful > 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}.`,
        });
        
        // Refresh the data
        await loadNotes({ reset: true });
        setSelectedNotes([]);
      }
      
      if (failed > 0 && successful === 0) {
        toast({
          title: "Error",
          description: `Failed to delete ${failed} SOAP note${failed > 1 ? 's' : ''}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete SOAP notes. Please try again.",
        variant: "destructive",
      });
    }
  }, [basedeleteSOAPNote, toast, loadNotes]);

  const bulkExport = useCallback(async (noteIds: string[]) => {
    try {
      const { exportSOAPNoteToPDF } = await import('@/services/pdfExport');
      const notesToExport = soapNotes.filter(note => noteIds.includes(note.id));
      
      if (notesToExport.length === 0) {
        toast({
          title: "Error",
          description: "No notes found to export.",
          variant: "destructive",
        });
        return;
      }

      // For bulk export, we'll export each note individually
      for (const note of notesToExport) {
        await exportSOAPNoteToPDF(note, 'Patient Export');
      }
      
      toast({
        title: "Success",
        description: `Successfully exported ${notesToExport.length} SOAP note${notesToExport.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error('Bulk export failed:', error);
      toast({
        title: "Error",
        description: "Failed to export SOAP notes. Please try again.",
        variant: "destructive",
      });
    }
  }, [soapNotes, toast]);

  // Single note operations
  const deleteSOAPNote = useCallback(async (noteId: string) => {
    const success = await basedeleteSOAPNote(noteId);
    if (success) {
      // Remove from selection if selected
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
      await loadNotes({ reset: true });
    }
    return success;
  }, [basedeleteSOAPNote, loadNotes]);

  return {
    // Data
    notes: paginatedNotes,
    filteredNotes,
    allNotes: soapNotes,
    
    // State
    loading,
    error,
    
    // Search & Filter
    searchQuery,
    filters,
    handleSearch,
    handleFilterChange,
    
    // Pagination
    paginationState,
    loadMore,
    
    // Selection
    selectedNotes,
    handleSelectionChange,
    selectAll,
    clearSelection,
    
    // Operations
    deleteSOAPNote,
    bulkDelete,
    bulkExport,
    createSOAPNote,
    updateSOAPNote,
    getSOAPNote,
    refreshNotes: loadNotes,
    
    // Stats
    stats: {
      total: filteredNotes.length,
      displayed: paginatedNotes.length,
      selected: selectedNotes.length,
      drafts: filteredNotes.filter(n => n.is_draft).length,
      complete: filteredNotes.filter(n => !n.is_draft).length,
    }
  };
}