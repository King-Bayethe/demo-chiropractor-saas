-- Fix patient visibility issue by updating RLS policies and access functions

-- First, update the get_current_user_role function to handle all valid roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(role, 'staff') FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Update the can_access_patient function to allow healthcare staff broader access
CREATE OR REPLACE FUNCTION public.can_access_patient(patient_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  DECLARE
    user_role TEXT;
    is_assigned BOOLEAN := FALSE;
  BEGIN
    -- Get current user role
    SELECT COALESCE(role, 'staff') INTO user_role FROM public.profiles WHERE user_id = auth.uid();
    
    -- Admins, overlords, doctors, and staff can access all patients
    IF user_role IN ('admin', 'overlord', 'doctor', 'staff', 'provider') THEN
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
$function$;

-- Update the patients table RLS policy to allow healthcare staff to view all patients
DROP POLICY IF EXISTS "Users can only view assigned patients or admins can view all" ON public.patients;

CREATE POLICY "Healthcare staff can view all patients"
ON public.patients
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    can_access_patient(id)
  )
);

-- Update the patients update policy as well
DROP POLICY IF EXISTS "Users can only update assigned patients or admins can update al" ON public.patients;

CREATE POLICY "Healthcare staff can update patients"
ON public.patients
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    can_access_patient(id)
  )
);

-- Update SOAP notes RLS policy to match
DROP POLICY IF EXISTS "Users can only view SOAP notes for assigned patients" ON public.soap_notes;

CREATE POLICY "Healthcare staff can view SOAP notes"
ON public.soap_notes
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    can_access_patient(patient_id)
  )
);

-- Update appointments RLS policy to match
DROP POLICY IF EXISTS "Users can only view appointments for assigned patients" ON public.appointments;

CREATE POLICY "Healthcare staff can view appointments"
ON public.appointments
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    (patient_id IS NOT NULL AND can_access_patient(patient_id)) OR 
    provider_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can only update appointments for assigned patients" ON public.appointments;

CREATE POLICY "Healthcare staff can update appointments"
ON public.appointments
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    (patient_id IS NOT NULL AND can_access_patient(patient_id)) OR 
    provider_id = auth.uid()
  )
);

-- Update patient notes RLS policy
DROP POLICY IF EXISTS "Users can only view notes for assigned patients" ON public.patient_notes;

CREATE POLICY "Healthcare staff can view patient notes"
ON public.patient_notes
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    can_access_patient(patient_id)
  )
);

-- Update patient files RLS policy
DROP POLICY IF EXISTS "Users can only view files for assigned patients" ON public.patient_files;

CREATE POLICY "Healthcare staff can view patient files"
ON public.patient_files
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() IN ('admin', 'overlord', 'doctor', 'staff', 'provider') OR 
    can_access_patient(patient_id)
  )
);