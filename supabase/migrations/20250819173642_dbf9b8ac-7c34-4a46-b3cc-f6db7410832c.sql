-- Fix security issue: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.create_opportunity_from_form()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create opportunity for new form submissions
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
    'Online Form',
    NEW.id,
    'lead',
    'pending',
    COALESCE(
      (SELECT user_id FROM public.profiles LIMIT 1),
      '00000000-0000-0000-0000-000000000000'::uuid
    ),
    'Auto-created from form submission on ' || NEW.created_at::date
  );
  
  RETURN NEW;
END;
$$;