-- Update the validate_form_submission function to fix field validation issues
CREATE OR REPLACE FUNCTION public.validate_form_submission(form_data_param jsonb, form_type_param text, honeypot_value text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check honeypot field (should be empty)
  IF honeypot_value IS NOT NULL AND honeypot_value != '' THEN
    RETURN false;
  END IF;
  
  -- Validate required fields based on form type
  CASE form_type_param
    WHEN 'pip' THEN
      -- Check for either new structure (firstName/lastName/email) or old structure (patient_name/patient_email)
      IF NOT (
        (form_data_param ? 'firstName' AND form_data_param ? 'lastName' AND form_data_param ? 'email') OR
        (form_data_param ? 'patient_name' AND form_data_param ? 'patient_email')
      ) THEN
        RETURN false;
      END IF;
    WHEN 'lop' THEN
      -- Check for either new structure or old structure - fix the attorney_name field validation
      IF NOT (
        (form_data_param ? 'firstName' AND form_data_param ? 'lastName' AND form_data_param ? 'attorneyName') OR
        (form_data_param ? 'patient_name' AND form_data_param ? 'attorneyName')
      ) THEN
        RETURN false;
      END IF;
    WHEN 'cash' THEN
      -- Check for either new structure or old structure - fix phone field validation
      IF NOT (
        (form_data_param ? 'firstName' AND form_data_param ? 'lastName' AND (form_data_param ? 'cellPhone' OR form_data_param ? 'homePhone')) OR
        (form_data_param ? 'patient_name' AND form_data_param ? 'patient_phone')
      ) THEN
        RETURN false;
      END IF;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN true;
END;
$function$;