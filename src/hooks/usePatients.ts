import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id: string;
  ghl_contact_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  cell_phone?: string;
  home_phone?: string;
  work_phone?: string;
  date_of_birth?: string;
  gender?: string;
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  drivers_license?: string;
  drivers_license_state?: string;
  social_security_number?: string;
  marital_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  employment_status?: string;
  employer_name?: string;
  employer_address?: string;
  student_status?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  auto_insurance_company?: string;
  auto_policy_number?: string;
  claim_number?: string;
  adjuster_name?: string;
  health_insurance?: string;
  health_insurance_id?: string;
  medicaid_medicare_id?: string;
  insurance_phone_number?: string;
  did_go_to_hospital?: boolean;
  hospital_name?: string;
  group_number?: string;
  attorney_name?: string;
  attorney_phone?: string;
  accident_date?: string;
  accident_time?: string;
  accident_description?: string;
  person_type?: string;
  weather_conditions?: string;
  street_surface?: string;
  body_part_hit?: string;
  what_body_hit?: string;
  medical_systems_review?: any;
  pip_form_submitted_at?: string;
  consent_acknowledgement?: boolean;
  patient_signature?: string;
  signature_date?: string;
  case_type?: string;
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

  const createPatient = async (patientData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    preferred_language?: string;
    case_type?: string;
    attorney_name?: string;
    insurance_provider?: string;
  }) => {
    try {
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          first_name: patientData.first_name,
          last_name: patientData.last_name,
          email: patientData.email,
          phone: patientData.phone,
          preferred_language: patientData.preferred_language,
          case_type: patientData.case_type,
          attorney_name: patientData.attorney_name,
          insurance_provider: patientData.insurance_provider,
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

  const deletePatient = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      await fetchPatients(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error deleting patient:', err);
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
    createPatient,
    updatePatient,
    deletePatient,
  };
};