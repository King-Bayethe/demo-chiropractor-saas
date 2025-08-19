-- Create opportunities table for medical CRM
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic opportunity info
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'lead',
  priority TEXT DEFAULT 'medium',
  
  -- Patient relationship
  patient_id UUID REFERENCES public.patients(id),
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  
  -- Medical CRM specific fields
  case_type TEXT,
  estimated_value DECIMAL(10,2),
  insurance_coverage_amount DECIMAL(10,2),
  attorney_referred BOOLEAN DEFAULT false,
  attorney_name TEXT,
  attorney_contact TEXT,
  
  -- Pipeline tracking
  pipeline_stage TEXT NOT NULL DEFAULT 'lead',
  expected_close_date DATE,
  consultation_scheduled_at TIMESTAMP WITH TIME ZONE,
  treatment_start_date DATE,
  
  -- Source tracking
  source TEXT,
  referral_source TEXT,
  form_submission_id UUID REFERENCES public.form_submissions(id),
  
  -- Assignment and ownership
  assigned_to UUID,
  assigned_provider_name TEXT,
  created_by UUID NOT NULL,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all opportunities"
ON public.opportunities
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create opportunities"
ON public.opportunities
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update opportunities"
ON public.opportunities
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete opportunities"
ON public.opportunities
FOR DELETE
USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_opportunities_patient_id ON public.opportunities(patient_id);
CREATE INDEX idx_opportunities_case_type ON public.opportunities(case_type);
CREATE INDEX idx_opportunities_pipeline_stage ON public.opportunities(pipeline_stage);
CREATE INDEX idx_opportunities_assigned_to ON public.opportunities(assigned_to);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_expected_close_date ON public.opportunities(expected_close_date);

-- Create trigger for updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create opportunity from form submission
CREATE OR REPLACE FUNCTION public.create_opportunity_from_form()
RETURNS TRIGGER AS $$
BEGIN
  -- Create opportunity for new form submissions
  INSERT INTO public.opportunities (
    name,
    description,
    patient_name,
    patient_email,
    patient_phone,
    case_type,
    source,
    form_submission_id,
    pipeline_stage,
    status,
    created_by,
    notes
  ) VALUES (
    COALESCE(NEW.patient_name, 'New ' || NEW.form_type || ' Submission'),
    'Opportunity created from ' || NEW.form_type || ' form submission',
    NEW.patient_name,
    NEW.patient_email,
    NEW.patient_phone,
    CASE 
      WHEN NEW.form_type = 'pip' THEN 'PIP'
      WHEN NEW.form_type = 'lop' THEN 'Attorney Only'
      ELSE 'Cash Plan'
    END,
    'Online Form',
    NEW.id,
    'lead',
    'pending',
    COALESCE(
      (SELECT user_id FROM public.profiles LIMIT 1),
      '00000000-0000-0000-0000-000000000000'::uuid
    ),
    'Auto-created from form submission on ' || NEW.created_at::date
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create opportunities from form submissions
CREATE TRIGGER create_opportunity_from_form_trigger
  AFTER INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_opportunity_from_form();