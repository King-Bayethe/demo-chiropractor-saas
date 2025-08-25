-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.sync_patient_to_ghl()
RETURNS TRIGGER AS $$
DECLARE
  contact_data JSONB;
  response RECORD;
BEGIN
  -- Only proceed if we have basic contact information
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL OR NEW.email IS NOT NULL OR NEW.phone IS NOT NULL THEN
    
    -- Build the contact data for GHL
    contact_data := jsonb_build_object(
      'firstName', COALESCE(NEW.first_name, ''),
      'lastName', COALESCE(NEW.last_name, ''),
      'email', NEW.email,
      'phone', NEW.phone,
      'address1', NEW.address,
      'city', NEW.city,
      'state', NEW.state,
      'postalCode', NEW.zip_code,
      'dateOfBirth', NEW.date_of_birth,
      'source', 'Patient Database',
      'tags', ARRAY['patient']
    );

    -- Call the edge function to create contact in GHL
    -- This will be handled asynchronously to avoid blocking the patient creation
    PERFORM 
      net.http_post(
        url := 'https://togpcxapjuqrzbzqilbt.supabase.co/functions/v1/ghl-contacts',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object(
          'action', 'create',
          'data', contact_data,
          'patientId', NEW.id::text
        )
      );

    -- Log the sync attempt
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      new_data
    ) VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'ghl_sync_initiated',
      'patients',
      NEW.id,
      jsonb_build_object('contact_data', contact_data)
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';