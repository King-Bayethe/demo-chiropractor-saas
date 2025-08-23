-- Add missing medical history and emergency contact fields to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS current_medications text,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS past_injuries text,
ADD COLUMN IF NOT EXISTS chronic_conditions text,
ADD COLUMN IF NOT EXISTS other_medical_history text,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;