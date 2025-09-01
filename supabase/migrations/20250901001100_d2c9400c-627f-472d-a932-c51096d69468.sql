-- Create documents table for organization-wide document management
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'General',
  patient_id UUID NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NULL, -- Denormalized for easier queries
  file_path TEXT NOT NULL,
  file_size BIGINT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT NULL,
  referral_source TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document access
CREATE POLICY "Authenticated users can create documents"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Healthcare staff can view all documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() = ANY(ARRAY['admin', 'overlord', 'doctor', 'staff', 'provider']) OR
    (patient_id IS NOT NULL AND can_access_patient(patient_id))
  )
);

CREATE POLICY "Users can update documents they uploaded"
ON public.documents
FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete documents they uploaded"
ON public.documents
FOR DELETE
USING (auth.uid() = uploaded_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);