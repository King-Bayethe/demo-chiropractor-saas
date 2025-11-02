import { useQuery } from "@tanstack/react-query";
import { mockDocuments } from "@/data/mockDocuments";
import { useState } from "react";

export interface DocumentFilters {
  search: string;
  patientId?: string;
  fileType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useDocuments = () => {
  const [filters, setFilters] = useState<DocumentFilters>({
    search: "",
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      // Filter mock documents based on filters
      let filtered = [...mockDocuments];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(doc => 
          doc.name.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filters.patientId) {
        filtered = filtered.filter(doc => doc.patient_id === filters.patientId);
      }

      if (filters.fileType) {
        filtered = filtered.filter(doc => doc.file_type === filters.fileType);
      }

      if (filters.status) {
        filtered = filtered.filter(doc => doc.status === filters.status);
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(doc => new Date(doc.created_at) >= new Date(filters.dateFrom!));
      }

      if (filters.dateTo) {
        filtered = filtered.filter(doc => new Date(doc.created_at) <= new Date(filters.dateTo!));
      }

      return filtered;
    },
  });

  const stats = {
    totalDocuments: documents.length,
    pendingReview: documents.filter(d => d.status === 'pending_review').length,
    thisMonth: documents.filter(d => {
      const docDate = new Date(d.created_at);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && 
             docDate.getFullYear() === now.getFullYear();
    }).length,
    fileTypes: Array.from(new Set(documents.map(d => d.file_type))).length,
  };

  return {
    documents,
    isLoading,
    filters,
    setFilters,
    stats,
  };
};
