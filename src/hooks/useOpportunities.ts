import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoData } from './useDemoData';

export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  
  // Patient relationship
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  
  // Medical CRM specific fields
  case_type?: string;
  estimated_value?: number;
  insurance_coverage_amount?: number;
  attorney_referred: boolean;
  attorney_name?: string;
  attorney_contact?: string;
  
  // Pipeline tracking
  pipeline_id?: string;
  pipeline_stage_id?: string;
  pipeline_stage: string; // Legacy field for backward compatibility
  expected_close_date?: string;
  consultation_scheduled_at?: string;
  treatment_start_date?: string;
  
  // Source tracking
  source?: string;
  referral_source?: string;
  form_submission_id?: string;
  
  // Assignment and ownership
  assigned_to?: string;
  assigned_provider_name?: string;
  created_by: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
}

// Generic healthcare pipeline stages - suitable for any medical practice
export const MEDICAL_PIPELINE_STAGES = [
  { id: 'lead', title: 'New Lead', color: 'bg-slate-500' },
  { id: 'qualified', title: 'Qualified Prospect', color: 'bg-blue-500' },
  { id: 'scheduled', title: 'Appointment Scheduled', color: 'bg-cyan-500' },
  { id: 'consultation', title: 'Initial Consultation', color: 'bg-violet-500' },
  { id: 'active', title: 'Active Treatment', color: 'bg-yellow-500' },
  { id: 'followup', title: 'Follow-up Care', color: 'bg-orange-500' },
  { id: 'completed', title: 'Care Completed', color: 'bg-emerald-500' },
];

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching opportunities",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check for duplicate opportunities
  const checkForDuplicates = async (patientName: string, patientEmail?: string, patientPhone?: string) => {
    try {
      const { data, error } = await supabase.rpc('find_duplicate_opportunities', {
        check_name: patientName,
        check_email: patientEmail || null,
        check_phone: patientPhone || null
      });

      if (error) {
        console.error('Error checking for duplicates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };

  const createOpportunity = async (opportunityData: Partial<Opportunity>, skipDuplicateCheck: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for duplicates unless explicitly skipped
      if (!skipDuplicateCheck && opportunityData.patient_name) {
        const duplicates = await checkForDuplicates(
          opportunityData.patient_name,
          opportunityData.patient_email,
          opportunityData.patient_phone
        );

        if (duplicates.length > 0) {
          const duplicateNames = duplicates.map(d => `${d.patient_name} (${d.pipeline_stage})`).join(', ');
          const confirmCreate = window.confirm(
            `Found ${duplicates.length} existing opportunity(ies) for similar patient(s): ${duplicateNames}\n\nDo you still want to create a new opportunity?`
          );
          
          if (!confirmCreate) {
            toast({
              title: "Opportunity creation cancelled",
              description: "Operation cancelled to avoid duplicate.",
            });
            return null;
          }
        }
      }

      // Helper function to process date fields
      const processDateField = (dateValue: any): string | null => {
        if (!dateValue) return null;
        if (typeof dateValue === 'string' && dateValue.trim() === '') return null;
        return dateValue;
      };

      // Ensure required fields are present and process dates properly
      const insertData = {
        name: opportunityData.name || 'New Opportunity',
        description: opportunityData.description || null,
        status: opportunityData.status || 'lead',
        priority: opportunityData.priority || 'medium',
        patient_id: opportunityData.patient_id || null,
        patient_name: opportunityData.patient_name || null,
        patient_email: opportunityData.patient_email || null,
        patient_phone: opportunityData.patient_phone || null,
        case_type: opportunityData.case_type || null,
        estimated_value: opportunityData.estimated_value || null,
        insurance_coverage_amount: opportunityData.insurance_coverage_amount || null,
        attorney_referred: opportunityData.attorney_referred || false,
        attorney_name: opportunityData.attorney_name || null,
        attorney_contact: opportunityData.attorney_contact || null,
        pipeline_stage: opportunityData.pipeline_stage || 'lead',
        expected_close_date: processDateField(opportunityData.expected_close_date),
        consultation_scheduled_at: processDateField(opportunityData.consultation_scheduled_at),
        treatment_start_date: processDateField(opportunityData.treatment_start_date),
        source: opportunityData.source || null,
        referral_source: opportunityData.referral_source || null,
        form_submission_id: opportunityData.form_submission_id || null,
        assigned_to: opportunityData.assigned_to || null,
        assigned_provider_name: opportunityData.assigned_provider_name || null,
        tags: opportunityData.tags || null,
        notes: opportunityData.notes || null,
        last_contact_date: processDateField(opportunityData.last_contact_date),
        next_follow_up_date: processDateField(opportunityData.next_follow_up_date),
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchOpportunities();
      toast({
        title: "Opportunity created",
        description: "New opportunity has been added successfully.",
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: "Error creating opportunity",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchOpportunities();
      toast({
        title: "Opportunity updated",
        description: "Opportunity has been updated successfully.",
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: "Error updating opportunity",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateOpportunityStage = async (id: string, newStage: string) => {
    return updateOpportunity(id, { pipeline_stage: newStage });
  };

  const moveOpportunityToPreviousStage = async (id: string, currentStage: string) => {
    const currentIndex = MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === currentStage);
    if (currentIndex > 0) {
      const previousStage = MEDICAL_PIPELINE_STAGES[currentIndex - 1];
      return updateOpportunityStage(id, previousStage.id);
    }
  };

  const moveOpportunityToNextStage = async (id: string, currentStage: string) => {
    const currentIndex = MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === currentStage);
    if (currentIndex < MEDICAL_PIPELINE_STAGES.length - 1) {
      const nextStage = MEDICAL_PIPELINE_STAGES[currentIndex + 1];
      return updateOpportunityStage(id, nextStage.id);
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchOpportunities();
      toast({
        title: "Opportunity deleted",
        description: "Opportunity has been deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error deleting opportunity",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    updateOpportunityStage,
    moveOpportunityToPreviousStage,
    moveOpportunityToNextStage,
    deleteOpportunity,
    checkForDuplicates,
  };
};