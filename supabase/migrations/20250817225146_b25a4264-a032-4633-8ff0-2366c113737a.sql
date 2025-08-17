-- Create SOAP Notes table with comprehensive data structure
CREATE TABLE public.soap_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  provider_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  appointment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_of_service TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chief_complaint TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  
  -- Subjective data (JSONB for flexible storage)
  subjective_data JSONB NOT NULL DEFAULT '{}',
  
  -- Objective data (JSONB for flexible storage)  
  objective_data JSONB NOT NULL DEFAULT '{}',
  
  -- Assessment data (JSONB for flexible storage)
  assessment_data JSONB NOT NULL DEFAULT '{}',
  
  -- Plan data (JSONB for flexible storage)
  plan_data JSONB NOT NULL DEFAULT '{}',
  
  -- Legacy fields for compatibility
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Vital signs (stored separately for easy querying)
  vital_signs JSONB,
  
  -- Metadata
  created_by UUID NOT NULL,
  last_modified_by UUID NOT NULL
);

-- Create SOAP Note attachments table
CREATE TABLE public.soap_note_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  soap_note_id UUID NOT NULL REFERENCES public.soap_notes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create SOAP Note templates table
CREATE TABLE public.soap_note_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  chief_complaint TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soap_note_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soap_note_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for soap_notes
CREATE POLICY "Authenticated users can view soap notes" 
ON public.soap_notes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create soap notes" 
ON public.soap_notes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update soap notes they created" 
ON public.soap_notes 
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() = last_modified_by);

CREATE POLICY "Users can delete soap notes they created" 
ON public.soap_notes 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for soap_note_attachments
CREATE POLICY "Users can view attachments for soap notes they can see" 
ON public.soap_note_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.soap_notes 
    WHERE id = soap_note_id AND auth.uid() IS NOT NULL
  )
);

CREATE POLICY "Users can create attachments for soap notes" 
ON public.soap_note_attachments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own attachments" 
ON public.soap_note_attachments 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own attachments" 
ON public.soap_note_attachments 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for soap_note_templates
CREATE POLICY "Users can view public templates and their own" 
ON public.soap_note_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create templates" 
ON public.soap_note_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.soap_note_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" 
ON public.soap_note_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_soap_notes_patient_id ON public.soap_notes(patient_id);
CREATE INDEX idx_soap_notes_provider_id ON public.soap_notes(provider_id);
CREATE INDEX idx_soap_notes_date_service ON public.soap_notes(date_of_service);
CREATE INDEX idx_soap_notes_created_by ON public.soap_notes(created_by);
CREATE INDEX idx_soap_notes_draft ON public.soap_notes(is_draft);
CREATE INDEX idx_soap_note_attachments_soap_note_id ON public.soap_note_attachments(soap_note_id);
CREATE INDEX idx_soap_note_templates_public ON public.soap_note_templates(is_public);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_soap_notes_updated_at
  BEFORE UPDATE ON public.soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soap_note_templates_updated_at
  BEFORE UPDATE ON public.soap_note_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get SOAP notes with patient info
CREATE OR REPLACE FUNCTION public.get_soap_notes_with_patient_info(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  patient_id UUID,
  patient_name TEXT,
  provider_id UUID,
  provider_name TEXT,
  appointment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  date_of_service TIMESTAMP WITH TIME ZONE,
  chief_complaint TEXT,
  is_draft BOOLEAN,
  subjective_data JSONB,
  objective_data JSONB,
  assessment_data JSONB,
  plan_data JSONB,
  vital_signs JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.patient_id,
    COALESCE(
      NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''),
      p.email,
      'Unknown Patient'
    ) as patient_name,
    sn.provider_id,
    sn.provider_name,
    sn.appointment_id,
    sn.created_at,
    sn.updated_at,
    sn.date_of_service,
    sn.chief_complaint,
    sn.is_draft,
    sn.subjective_data,
    sn.objective_data,
    sn.assessment_data,
    sn.plan_data,
    sn.vital_signs
  FROM public.soap_notes sn
  LEFT JOIN public.patients p ON sn.patient_id = p.id
  WHERE auth.uid() IS NOT NULL
  ORDER BY sn.date_of_service DESC, sn.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;