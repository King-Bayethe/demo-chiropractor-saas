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

// Import and run the comprehensive mock PIP form test
import('./mockPIPFormSubmission').then(module => {
  console.log('Mock PIP form submission module loaded and executed');
}).catch(error => {
  console.error('Error loading mock PIP form submission:', error);
});