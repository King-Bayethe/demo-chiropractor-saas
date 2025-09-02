-- Phase 1: Clean up existing duplicate opportunities
-- Keep the oldest opportunity for each unique patient combination and delete the rest

WITH ranked_opportunities AS (
  SELECT 
    id,
    patient_name,
    patient_email,
    patient_phone,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        COALESCE(LOWER(TRIM(patient_name)), ''),
        COALESCE(LOWER(TRIM(patient_email)), ''),
        COALESCE(LOWER(TRIM(patient_phone)), '')
      ORDER BY created_at ASC
    ) as row_num
  FROM public.opportunities
  WHERE patient_name IS NOT NULL 
    AND patient_name != ''
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_opportunities 
  WHERE row_num > 1
)
DELETE FROM public.opportunities 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Phase 2: Update the create_opportunity_from_form trigger to prevent future duplicates
CREATE OR REPLACE FUNCTION public.create_opportunity_from_form()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_opportunity_id UUID;
  patient_name_clean TEXT;
  patient_email_clean TEXT;
  patient_phone_clean TEXT;
BEGIN
  -- Clean and normalize the patient data
  patient_name_clean := LOWER(TRIM(COALESCE(NEW.patient_name, '')));
  patient_email_clean := LOWER(TRIM(COALESCE(NEW.patient_email, '')));
  patient_phone_clean := LOWER(TRIM(COALESCE(NEW.patient_phone, '')));
  
  -- Skip if patient name is empty
  IF patient_name_clean = '' THEN
    RETURN NEW;
  END IF;
  
  -- Check for existing opportunity with same patient identifiers
  SELECT id INTO existing_opportunity_id
  FROM public.opportunities
  WHERE 
    LOWER(TRIM(COALESCE(patient_name, ''))) = patient_name_clean
    AND (
      (patient_email_clean != '' AND LOWER(TRIM(COALESCE(patient_email, ''))) = patient_email_clean)
      OR 
      (patient_phone_clean != '' AND LOWER(TRIM(COALESCE(patient_phone, ''))) = patient_phone_clean)
      OR
      (patient_email_clean = '' AND patient_phone_clean = '' AND LOWER(TRIM(COALESCE(patient_name, ''))) = patient_name_clean)
    )
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF existing_opportunity_id IS NOT NULL THEN
    -- Update existing opportunity with new form submission data
    UPDATE public.opportunities
    SET
      form_submission_id = NEW.id,
      patient_email = COALESCE(NEW.patient_email, patient_email),
      patient_phone = COALESCE(NEW.patient_phone, patient_phone),
      case_type = COALESCE(
        CASE NEW.form_type
          WHEN 'pip' THEN 'PIP'
          WHEN 'lop' THEN 'Attorney Only'
          ELSE 'Cash Plan'
        END,
        case_type
      ),
      source = CASE 
        WHEN NEW.form_type = 'pip' THEN 'PIP Form'
        WHEN NEW.form_type = 'lop' THEN 'LOP Form'
        WHEN NEW.form_type = 'cash' THEN 'Cash Form'
        WHEN NEW.form_type = 'soap_questionnaire' THEN 'SOAP Form'
        WHEN NEW.form_type = 'lead_intake' THEN 'Lead Intake Form'
        ELSE 'Online Form'
      END,
      notes = COALESCE(notes, '') || CASE 
        WHEN COALESCE(notes, '') = '' THEN ''
        ELSE E'\n\n'
      END || 'Updated from ' || NEW.form_type || ' form submission on ' || NEW.created_at::date,
      updated_at = now()
    WHERE id = existing_opportunity_id;
  ELSE
    -- Create new opportunity only if no duplicate exists
    INSERT INTO public.opportunities (
      name,
      description,
      patient_name,
      patient_email,
      patient_phone,
      case_type,
      source,
      form_submission_id,
      pipeline_stage,
      status,
      created_by,
      notes
    ) VALUES (
      COALESCE(NEW.patient_name, 'New ' || NEW.form_type || ' Submission'),
      'Opportunity created from ' || NEW.form_type || ' form submission',
      NEW.patient_name,
      NEW.patient_email,
      NEW.patient_phone,
      CASE 
        WHEN NEW.form_type = 'pip' THEN 'PIP'
        WHEN NEW.form_type = 'lop' THEN 'Attorney Only'
        ELSE 'Cash Plan'
      END,
      CASE 
        WHEN NEW.form_type = 'pip' THEN 'PIP Form'
        WHEN NEW.form_type = 'lop' THEN 'LOP Form'
        WHEN NEW.form_type = 'cash' THEN 'Cash Form'
        WHEN NEW.form_type = 'soap_questionnaire' THEN 'SOAP Form'
        WHEN NEW.form_type = 'lead_intake' THEN 'Lead Intake Form'
        ELSE 'Online Form'
      END,
      NEW.id,
      'lead',
      'pending',
      COALESCE(
        (SELECT user_id FROM public.profiles LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid
      ),
      'Auto-created from form submission on ' || NEW.created_at::date
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Phase 3: Add database indexes for better duplicate detection performance
CREATE INDEX IF NOT EXISTS idx_opportunities_patient_name_lower ON public.opportunities (LOWER(TRIM(patient_name)));
CREATE INDEX IF NOT EXISTS idx_opportunities_patient_email_lower ON public.opportunities (LOWER(TRIM(patient_email)));
CREATE INDEX IF NOT EXISTS idx_opportunities_patient_phone_lower ON public.opportunities (LOWER(TRIM(patient_phone)));
CREATE INDEX IF NOT EXISTS idx_opportunities_duplicate_check ON public.opportunities (LOWER(TRIM(patient_name)), LOWER(TRIM(patient_email)), LOWER(TRIM(patient_phone)));

-- Add a function to help detect potential duplicates
CREATE OR REPLACE FUNCTION public.find_duplicate_opportunities(
  check_name TEXT,
  check_email TEXT DEFAULT NULL,
  check_phone TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  pipeline_stage TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.patient_name,
    o.patient_email,
    o.patient_phone,
    o.created_at,
    o.pipeline_stage
  FROM public.opportunities o
  WHERE 
    LOWER(TRIM(COALESCE(o.patient_name, ''))) = LOWER(TRIM(COALESCE(check_name, '')))
    AND (
      (check_email IS NOT NULL AND LOWER(TRIM(COALESCE(o.patient_email, ''))) = LOWER(TRIM(check_email)))
      OR 
      (check_phone IS NOT NULL AND LOWER(TRIM(COALESCE(o.patient_phone, ''))) = LOWER(TRIM(check_phone)))
      OR
      (check_email IS NULL AND check_phone IS NULL)
    )
  ORDER BY o.created_at DESC;
END;
$function$;