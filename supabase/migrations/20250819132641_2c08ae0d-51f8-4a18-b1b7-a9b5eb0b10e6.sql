-- Add comprehensive PIP form fields to patients table
-- Additional phone fields
ALTER TABLE public.patients 
ADD COLUMN home_phone text,
ADD COLUMN work_phone text,
ADD COLUMN cell_phone text;

-- Driver's license information  
ALTER TABLE public.patients
ADD COLUMN drivers_license text,
ADD COLUMN drivers_license_state text;

-- Personal information
ALTER TABLE public.patients
ADD COLUMN social_security_number text,
ADD COLUMN marital_status text,
ADD COLUMN age integer;

-- Employment information
ALTER TABLE public.patients
ADD COLUMN employment_status text,
ADD COLUMN employer_name text, 
ADD COLUMN employer_address text,
ADD COLUMN student_status text;

-- Auto insurance information
ALTER TABLE public.patients
ADD COLUMN auto_insurance_company text,
ADD COLUMN auto_policy_number text,
ADD COLUMN claim_number text,
ADD COLUMN adjuster_name text;

-- Health insurance information  
ALTER TABLE public.patients
ADD COLUMN health_insurance text,
ADD COLUMN group_number text;

-- Attorney information
ALTER TABLE public.patients
ADD COLUMN attorney_name text,
ADD COLUMN attorney_phone text;

-- Accident information
ALTER TABLE public.patients
ADD COLUMN accident_date date,
ADD COLUMN accident_time time,
ADD COLUMN accident_description text,
ADD COLUMN person_type text,
ADD COLUMN weather_conditions text,
ADD COLUMN street_surface text,
ADD COLUMN body_part_hit text,
ADD COLUMN what_body_hit text;

-- Medical systems review as JSONB
ALTER TABLE public.patients
ADD COLUMN medical_systems_review jsonb DEFAULT '{}';

-- Form metadata
ALTER TABLE public.patients
ADD COLUMN pip_form_submitted_at timestamp with time zone,
ADD COLUMN consent_acknowledgement boolean DEFAULT false,
ADD COLUMN patient_signature text,
ADD COLUMN signature_date date;

-- Update the main phone field to use cell_phone as primary if available
-- Create a trigger to automatically set the main phone field
CREATE OR REPLACE FUNCTION public.update_patient_primary_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the primary phone field based on available phone numbers
  -- Priority: cell_phone > home_phone > work_phone
  NEW.phone = COALESCE(NEW.cell_phone, NEW.home_phone, NEW.work_phone);
  
  -- Set first_name and last_name if not already set and we have them from form data
  IF NEW.first_name IS NULL AND NEW.last_name IS NULL THEN
    -- These will be set by the submit-form function
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic phone field updates
CREATE TRIGGER update_patient_phone_trigger
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_primary_phone();

-- Add indexes for better performance on common search fields
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_cell_phone ON public.patients(cell_phone);
CREATE INDEX IF NOT EXISTS idx_patients_home_phone ON public.patients(home_phone);
CREATE INDEX IF NOT EXISTS idx_patients_work_phone ON public.patients(work_phone);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON public.patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_first_name ON public.patients(first_name);
CREATE INDEX IF NOT EXISTS idx_patients_drivers_license ON public.patients(drivers_license);
CREATE INDEX IF NOT EXISTS idx_patients_ssn ON public.patients(social_security_number);