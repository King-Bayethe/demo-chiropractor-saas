-- Add case_type column to patients table
ALTER TABLE public.patients 
ADD COLUMN case_type TEXT;

-- Add a comment to document the allowed values
COMMENT ON COLUMN public.patients.case_type IS 'Case type: PIP, Insurance, Slip and Fall, Workers Compensation, Cash Plan, Attorney Only';