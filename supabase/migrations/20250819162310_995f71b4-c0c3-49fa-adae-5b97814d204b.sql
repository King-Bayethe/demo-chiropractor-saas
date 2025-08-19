-- Add missing columns to patients table for complete form field mapping
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS health_insurance_id text,
ADD COLUMN IF NOT EXISTS medicaid_medicare_id text,
ADD COLUMN IF NOT EXISTS insurance_phone_number text,
ADD COLUMN IF NOT EXISTS did_go_to_hospital boolean,
ADD COLUMN IF NOT EXISTS hospital_name text;