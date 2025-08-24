-- Phase 1: EMERGENCY PII Protection - Implement Role-Based Access Control and Provider Assignments

-- First, add role column to profiles table for basic role management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'staff'::text;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user can access patient
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update RLS policies for patients table - CRITICAL SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON public.patients;
CREATE POLICY "Users can only view assigned patients or admins can view all"
ON public.patients FOR SELECT
USING (
  public.get_current_user_role() = 'admin' OR 
  public.can_access_patient(id)
);

DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
CREATE POLICY "Users can only update assigned patients or admins can update all"
ON public.patients FOR UPDATE
USING (
  public.get_current_user_role() = 'admin' OR 
  public.can_access_patient(id)
);

-- Update RLS policies for patient_files table - CRITICAL SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view patient files" ON public.patient_files;
CREATE POLICY "Users can only view files for assigned patients"
ON public.patient_files FOR SELECT
USING (
  public.get_current_user_role() = 'admin' OR 
  public.can_access_patient(patient_id)
);

-- Update RLS policies for soap_notes table - CRITICAL SECURITY FIX  
DROP POLICY IF EXISTS "Authenticated users can view soap notes" ON public.soap_notes;
CREATE POLICY "Users can only view SOAP notes for assigned patients"
ON public.soap_notes FOR SELECT
USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'admin' OR 
  public.can_access_patient(patient_id)
);

-- Update RLS policies for patient_notes table - CRITICAL SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view patient notes" ON public.patient_notes;
CREATE POLICY "Users can only view notes for assigned patients"
ON public.patient_notes FOR SELECT
USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'admin' OR 
  public.can_access_patient(patient_id)
);

-- Update RLS policies for appointments table - CRITICAL SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON public.appointments;
CREATE POLICY "Users can only view appointments for assigned patients"
ON public.appointments FOR SELECT
USING (
  public.get_current_user_role() = 'admin' OR 
  (patient_id IS NOT NULL AND public.can_access_patient(patient_id)) OR
  provider_id = auth.uid()
);

DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
CREATE POLICY "Users can only update appointments for assigned patients"
ON public.appointments FOR UPDATE
USING (
  public.get_current_user_role() = 'admin' OR 
  (patient_id IS NOT NULL AND public.can_access_patient(patient_id)) OR
  provider_id = auth.uid()
);

-- Update RLS policies for form_submissions table - SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view all form submissions" ON public.form_submissions;
CREATE POLICY "Only admins and staff can view form submissions"
ON public.form_submissions FOR SELECT
USING (
  public.get_current_user_role() IN ('admin', 'staff', 'provider')
);

-- Update RLS policies for opportunities table - SECURITY FIX
DROP POLICY IF EXISTS "Authenticated users can view all opportunities" ON public.opportunities;
CREATE POLICY "Users can view opportunities they created or are assigned to"
ON public.opportunities FOR SELECT
USING (
  auth.uid() = created_by OR
  auth.uid() = assigned_to OR
  public.get_current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON public.opportunities;
CREATE POLICY "Users can update opportunities they created or are assigned to"
ON public.opportunities FOR UPDATE
USING (
  auth.uid() = created_by OR
  auth.uid() = assigned_to OR
  public.get_current_user_role() = 'admin'
);

-- Create audit log table for tracking access to sensitive data
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Create function to log patient data access
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
$$ LANGUAGE plpgsql SECURITY DEFINER;