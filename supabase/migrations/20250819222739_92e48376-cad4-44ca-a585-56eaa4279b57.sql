-- Phase 1: Database Schema Updates

-- Add preferred_language column to patients table
ALTER TABLE public.patients 
ADD COLUMN preferred_language text DEFAULT 'English';

-- Create patient_notes table for general patient notes
CREATE TABLE public.patient_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'General'::text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create patient_files table for file management
CREATE TABLE public.patient_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text NOT NULL,
  category text DEFAULT 'General'::text,
  description text,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patient_notes
CREATE POLICY "Authenticated users can view patient notes" 
ON public.patient_notes FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create patient notes" 
ON public.patient_notes FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update patient notes they created" 
ON public.patient_notes FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete patient notes they created" 
ON public.patient_notes FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for patient_files
CREATE POLICY "Authenticated users can view patient files" 
ON public.patient_files FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload patient files" 
ON public.patient_files FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete files they uploaded" 
ON public.patient_files FOR DELETE 
USING (auth.uid() = uploaded_by);

-- Create storage bucket for patient files
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-files', 'patient-files', false);

-- Create storage policies for patient files
CREATE POLICY "Authenticated users can view patient files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload patient files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'patient-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patient files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'patient-files' AND auth.uid() IS NOT NULL);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_patient_notes_updated_at
  BEFORE UPDATE ON public.patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_patient_notes_patient_id ON public.patient_notes(patient_id);
CREATE INDEX idx_patient_notes_category ON public.patient_notes(category);
CREATE INDEX idx_patient_files_patient_id ON public.patient_files(patient_id);
CREATE INDEX idx_patient_files_category ON public.patient_files(category);