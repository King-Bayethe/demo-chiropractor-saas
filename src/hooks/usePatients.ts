import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id: string;
  ghl_contact_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  tags?: string[];
  is_active: boolean;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const syncWithGHL = async (ghlContactId?: string) => {
    try {
      const { data, error: syncError } = await supabase.functions.invoke('patient-sync', {
        body: { 
          action: ghlContactId ? 'syncSingle' : 'syncAll',
          ghlContactId 
        }
      });

      if (syncError) throw syncError;
      
      // Refresh patients after sync
      await fetchPatients();
      
      return data;
    } catch (err) {
      console.error('Error syncing with GHL:', err);
      throw err;
    }
  };

  const findOrCreatePatient = async (formData: {
    patient_name?: string;
    patient_email?: string;
    patient_phone?: string;
  }) => {
    try {
      // Try to find existing patient by email or phone
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .or(`email.eq.${formData.patient_email},phone.eq.${formData.patient_phone}`)
        .single();

      if (existingPatient) {
        return existingPatient;
      }

      // Create new patient if not found
      const nameParts = formData.patient_name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: formData.patient_email,
          phone: formData.patient_phone,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      await fetchPatients(); // Refresh the list
      return newPatient;
    } catch (err) {
      console.error('Error finding/creating patient:', err);
      throw err;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      await fetchPatients(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error updating patient:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    syncWithGHL,
    findOrCreatePatient,
    updatePatient,
  };
};