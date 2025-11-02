import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FormFilters {
  formType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const useFormSubmissions = (filters: FormFilters = {}) => {
  return useQuery({
    queryKey: ['form-submissions', filters],
    queryFn: async () => {
      let query = supabase
        .from('form_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (filters.formType) {
        query = query.eq('form_type', filters.formType);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('submitted_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('submitted_at', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`patient_name.ilike.%${filters.search}%,patient_email.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useFormStats = () => {
  return useQuery({
    queryKey: ['form-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*');
      
      if (error) throw error;
      
      const now = new Date();
      const thisMonth = data?.filter(s => {
        const submittedDate = new Date(s.submitted_at);
        return submittedDate.getMonth() === now.getMonth() && 
               submittedDate.getFullYear() === now.getFullYear();
      }) || [];
      
      const lastMonth = data?.filter(s => {
        const submittedDate = new Date(s.submitted_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return submittedDate.getMonth() === lastMonthDate.getMonth() && 
               submittedDate.getFullYear() === lastMonthDate.getFullYear();
      }) || [];
      
      const pendingCount = data?.filter(s => s.status === 'pending').length || 0;
      
      const avgTime = data?.reduce((acc, curr) => {
        return acc + (curr.submission_time_ms || 0);
      }, 0) / (data?.length || 1);
      
      const monthlyGrowth = lastMonth.length > 0 
        ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 
        : 0;
      
      return {
        totalSubmissions: data?.length || 0,
        thisMonthCount: thisMonth.length,
        pendingCount,
        avgCompletionTime: Math.round(avgTime / 1000 / 60 * 10) / 10, // minutes
        monthlyGrowth: Math.round(monthlyGrowth)
      };
    }
  });
};
