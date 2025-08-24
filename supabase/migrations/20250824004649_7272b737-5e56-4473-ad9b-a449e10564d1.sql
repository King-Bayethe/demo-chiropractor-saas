-- Fix security linter warnings for function search paths

-- Update existing functions to include proper search_path for security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.can_access_patient(patient_id_param uuid)
RETURNS BOOLEAN AS $$
  DECLARE
    user_role TEXT;
    is_assigned BOOLEAN := FALSE;
  BEGIN
    -- Get current user role
    SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
    
    -- Admins can access all patients
    IF user_role = 'admin' THEN
      RETURN TRUE;
    END IF;
    
    -- Check if user is assigned to this patient
    SELECT EXISTS(
      SELECT 1 FROM public.patient_providers 
      WHERE patient_id = patient_id_param 
      AND provider_id = auth.uid() 
      AND is_active = true
    ) INTO is_assigned;
    
    RETURN is_assigned;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.log_patient_access(
  action_param text,
  table_name_param text,
  record_id_param uuid,
  old_data_param jsonb DEFAULT NULL,
  new_data_param jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_data, new_data
  ) VALUES (
    auth.uid(), action_param, table_name_param, record_id_param, old_data_param, new_data_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';