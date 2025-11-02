-- Migration 4: Security Hardening and Data Quality Improvements
-- This migration fixes function search paths and adds data validation constraints

-- ==========================================
-- PART A: FIX SECURITY DEFINER FUNCTION SEARCH PATHS
-- This prevents schema injection attacks
-- ==========================================

-- Update existing SECURITY DEFINER functions to have immutable search_path
ALTER FUNCTION public.update_chat_last_message() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_patient_primary_phone() SET search_path = public;
ALTER FUNCTION public.get_current_user_organization() SET search_path = public;
ALTER FUNCTION public.update_conversation_last_message() SET search_path = public;
ALTER FUNCTION public.update_unread_count() SET search_path = public;
ALTER FUNCTION public.update_conversation_on_sync() SET search_path = public;
ALTER FUNCTION public.user_belongs_to_organization(uuid) SET search_path = public;
ALTER FUNCTION public.get_soap_notes_with_patient_info(integer, integer) SET search_path = public;
ALTER FUNCTION public.get_colleague_basic_info() SET search_path = public;
ALTER FUNCTION public.assign_patient_to_provider(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.is_chat_participant(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.unassign_patient_from_provider(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.log_patient_access(text, text, uuid, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.sync_patient_to_ghl() SET search_path = public;
ALTER FUNCTION public.find_duplicate_opportunities(text, text, text) SET search_path = public;
ALTER FUNCTION public.log_form_submission_event() SET search_path = public;
ALTER FUNCTION public.can_access_patient(uuid) SET search_path = public;
ALTER FUNCTION public.validate_form_submission(jsonb, text, text) SET search_path = public;
ALTER FUNCTION public.create_opportunity_from_form() SET search_path = public;
ALTER FUNCTION public.check_form_submission_rate_limit(inet, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.create_patient_from_form_submission() SET search_path = public;
ALTER FUNCTION public.handle_new_participant() SET search_path = public;
ALTER FUNCTION public.handle_profile_name_update() SET search_path = public;
ALTER FUNCTION public.is_chat_admin(uuid, uuid) SET search_path = public;

-- ==========================================
-- PART B: CLEAN UP TEST DATA
-- Remove timestamp-based identifiers and invalid test data
-- ==========================================

-- Clean up patient names with timestamp artifacts
UPDATE public.patients
SET 
  first_name = TRIM(REGEXP_REPLACE(first_name, '\d{13}', '', 'g')),
  last_name = TRIM(REGEXP_REPLACE(last_name, '\d{13}', '', 'g'))
WHERE 
  first_name ~ '\d{13}' OR 
  last_name ~ '\d{13}';

-- Clean up invalid email addresses
UPDATE public.patients
SET email = NULL
WHERE 
  email LIKE '%test-timestamp%' OR
  email LIKE '%@example.com%' OR
  email LIKE '%example.com%';

-- Remove completely invalid patient records (no name AND no contact info)
DELETE FROM public.patients
WHERE 
  (first_name IS NULL OR TRIM(first_name) = '') AND
  (last_name IS NULL OR TRIM(last_name) = '') AND
  (email IS NULL OR email = '') AND
  (phone IS NULL OR phone = '') AND
  (cell_phone IS NULL OR cell_phone = '') AND
  (home_phone IS NULL OR home_phone = '');

-- ==========================================
-- PART C: ADD DATA VALIDATION CONSTRAINTS
-- Ensure data quality at the database level
-- ==========================================

-- Constraint: Patient first name length must be reasonable (1-50 characters)
ALTER TABLE public.patients
ADD CONSTRAINT chk_patient_first_name_length 
CHECK (first_name IS NULL OR (LENGTH(TRIM(first_name)) >= 1 AND LENGTH(TRIM(first_name)) <= 50));

-- Constraint: Patient last name length must be reasonable (1-50 characters)
ALTER TABLE public.patients
ADD CONSTRAINT chk_patient_last_name_length 
CHECK (last_name IS NULL OR (LENGTH(TRIM(last_name)) >= 1 AND LENGTH(TRIM(last_name)) <= 50));

-- Constraint: At least one contact method must exist (email or any phone)
ALTER TABLE public.patients
ADD CONSTRAINT chk_patient_contact_info
CHECK (
  email IS NOT NULL OR 
  phone IS NOT NULL OR 
  cell_phone IS NOT NULL OR 
  home_phone IS NOT NULL
);

-- Constraint: Email format must be valid (basic regex check)
ALTER TABLE public.patients
ADD CONSTRAINT chk_patient_email_format
CHECK (
  email IS NULL OR 
  email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- ==========================================
-- PART D: ADD HELPFUL INDEXES FOR PERFORMANCE
-- ==========================================

-- Index for patient search by name
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(first_name, last_name) WHERE first_name IS NOT NULL OR last_name IS NOT NULL;

-- Index for patient search by email
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email) WHERE email IS NOT NULL;

-- Index for patient search by phone
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone) WHERE phone IS NOT NULL;

-- Index for active appointments by date range
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON public.appointments(start_time, end_time) WHERE status != 'cancelled';

-- Index for pending form submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_pending ON public.form_submissions(created_at) WHERE status = 'pending';

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, created_at) WHERE read = false;