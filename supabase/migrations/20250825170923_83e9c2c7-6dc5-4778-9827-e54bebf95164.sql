-- Add column to store GHL contact ID in patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;