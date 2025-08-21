import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PatientProvider {
  id: string;
  patient_id: string;
  provider_id: string;
  role: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  patients?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  profiles?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface Provider {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
}

export const usePatientProviders = () => {
  const [assignments, setAssignments] = useState<PatientProvider[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssignments = async (patientId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('patient_providers')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          profiles (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAssignments((data as any) || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;

      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch providers');
    }
  };

  const assignPatientToProvider = async (
    patientId: string, 
    providerId: string, 
    role: string = 'primary_provider'
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('assign_patient_to_provider', {
        patient_id_param: patientId,
        provider_id_param: providerId,
        role_param: role
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient assigned to provider successfully",
      });

      await fetchAssignments();
      return true;
    } catch (error) {
      console.error('Error assigning patient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign patient';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const unassignPatientFromProvider = async (
    patientId: string, 
    providerId: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('unassign_patient_from_provider', {
        patient_id_param: patientId,
        provider_id_param: providerId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient unassigned from provider successfully",
      });

      await fetchAssignments();
      return true;
    } catch (error) {
      console.error('Error unassigning patient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unassign patient';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const getAssignedPatients = async (providerId?: string) => {
    try {
      const user = await supabase.auth.getUser();
      const targetProviderId = providerId || user.data.user?.id;
      
      if (!targetProviderId) {
        throw new Error('Provider ID not available');
      }

      const { data, error } = await supabase
        .from('patient_providers')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            email,
            phone,
            ghl_contact_id
          )
        `)
        .eq('provider_id', targetProviderId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch assigned patients');
      return [];
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    assignments,
    providers,
    loading,
    error,
    fetchAssignments,
    fetchProviders,
    assignPatientToProvider,
    unassignPatientFromProvider,
    getAssignedPatients,
  };
};