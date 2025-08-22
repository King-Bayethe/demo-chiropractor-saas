import { supabase } from "@/integrations/supabase/client";

export const createPatientFromCashForm = async () => {
  console.log('Creating patient from cash form...');
  
  const { data, error } = await supabase.functions.invoke('create-patient-from-form', {
    body: { formSubmissionId: '753f393d-f661-465f-ba5b-e481450d9de4' }
  });
  
  if (error) {
    console.error('Error creating patient:', error);
    return { success: false, error };
  } else {
    console.log('Patient created successfully:', data);
    return { success: true, data };
  }
};

// Auto-execute when this file is imported
createPatientFromCashForm().then(result => {
  console.log('Final result:', result);
});