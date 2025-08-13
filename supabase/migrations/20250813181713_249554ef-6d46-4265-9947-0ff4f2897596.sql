-- Create form submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view all form submissions" 
ON public.form_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can create form submissions" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update form submissions" 
ON public.form_submissions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_form_submissions_form_type ON public.form_submissions(form_type);
CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);