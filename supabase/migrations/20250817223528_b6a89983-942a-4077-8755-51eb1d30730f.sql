-- Create patients table to sync with GHL contacts
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ghl_contact_id TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all patients" 
ON public.patients 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patients" 
ON public.patients 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add patient_id to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN patient_id UUID REFERENCES public.patients(id);

-- Create indexes for better performance
CREATE INDEX idx_patients_ghl_contact_id ON public.patients(ghl_contact_id);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX idx_form_submissions_patient_id ON public.form_submissions(patient_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();