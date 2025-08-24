import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  pipeline_stage: string;
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

export const MEDICAL_PIPELINE_STAGES = [
  { id: 'lead', title: 'New Lead', color: 'bg-slate-500' },
  { id: 'appointment', title: 'Appointment', color: 'bg-blue-500' },
  { id: 'checkedin', title: 'Checked-in', color: 'bg-yellow-500' },
  { id: 'visitcomplete', title: 'Visit Complete', color: 'bg-green-500' },
  { id: 'billing', title: 'Billing Pending', color: 'bg-orange-500' },
  { id: 'paymentcomplete', title: 'Payment Complete', color: 'bg-emerald-500' },
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

  const createOpportunity = async (opportunityData: Partial<Opportunity>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure required fields are present
      const insertData = {
        name: opportunityData.name || 'New Opportunity',
        description: opportunityData.description,
        status: opportunityData.status || 'lead',
        priority: opportunityData.priority || 'medium',
        patient_id: opportunityData.patient_id,
        patient_name: opportunityData.patient_name,
        patient_email: opportunityData.patient_email,
        patient_phone: opportunityData.patient_phone,
        case_type: opportunityData.case_type,
        estimated_value: opportunityData.estimated_value,
        insurance_coverage_amount: opportunityData.insurance_coverage_amount,
        attorney_referred: opportunityData.attorney_referred || false,
        attorney_name: opportunityData.attorney_name,
        attorney_contact: opportunityData.attorney_contact,
        pipeline_stage: opportunityData.pipeline_stage || 'lead',
        expected_close_date: opportunityData.expected_close_date,
        consultation_scheduled_at: opportunityData.consultation_scheduled_at,
        treatment_start_date: opportunityData.treatment_start_date,
        source: opportunityData.source,
        referral_source: opportunityData.referral_source,
        form_submission_id: opportunityData.form_submission_id,
        assigned_to: opportunityData.assigned_to,
        assigned_provider_name: opportunityData.assigned_provider_name,
        tags: opportunityData.tags,
        notes: opportunityData.notes,
        last_contact_date: opportunityData.last_contact_date,
        next_follow_up_date: opportunityData.next_follow_up_date,
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
    deleteOpportunity,
  };
};