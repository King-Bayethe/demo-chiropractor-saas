-- Add missing patient profile fields
ALTER TABLE public.patients 
ADD COLUMN pain_location TEXT,
ADD COLUMN pain_severity INTEGER CHECK (pain_severity >= 1 AND pain_severity <= 10),
ADD COLUMN family_medical_history TEXT,
ADD COLUMN smoking_status TEXT,
ADD COLUMN smoking_history TEXT,
ADD COLUMN profile_picture_url TEXT;

-- Add indexes for better performance
CREATE INDEX idx_patients_pain_severity ON public.patients(pain_severity);
CREATE INDEX idx_patients_smoking_status ON public.patients(smoking_status);