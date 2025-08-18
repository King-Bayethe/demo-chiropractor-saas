-- Create template management tables for Phase 3
CREATE TABLE IF NOT EXISTS public.custom_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  created_by UUID NOT NULL,
  organization_id TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  template_data JSONB NOT NULL,
  keywords TEXT[],
  specialty TEXT,
  age_groups TEXT[],
  urgency_level TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for custom templates
CREATE POLICY "Users can view approved templates or their own templates" 
ON public.custom_templates 
FOR SELECT 
USING (is_approved = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates" 
ON public.custom_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.custom_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" 
ON public.custom_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Template usage analytics table
CREATE TABLE IF NOT EXISTS public.template_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.custom_templates(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL, -- 'built-in' or 'custom'
  template_name TEXT NOT NULL,
  used_by UUID NOT NULL,
  patient_id TEXT,
  chief_complaint TEXT,
  usage_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for usage tracking
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own template usage" 
ON public.template_usage 
FOR SELECT 
USING (auth.uid() = used_by);

CREATE POLICY "Users can create their own usage records" 
ON public.template_usage 
FOR INSERT 
WITH CHECK (auth.uid() = used_by);

-- Template versions table
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.custom_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  template_data JSONB NOT NULL,
  change_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for versions
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of templates they can access" 
ON public.template_versions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.custom_templates ct 
    WHERE ct.id = template_id 
    AND (ct.is_approved = true OR ct.created_by = auth.uid())
  )
);

CREATE POLICY "Users can create versions for their own templates" 
ON public.template_versions 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND EXISTS (
    SELECT 1 FROM public.custom_templates ct 
    WHERE ct.id = template_id AND ct.created_by = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_custom_templates_category ON public.custom_templates(category);
CREATE INDEX idx_custom_templates_created_by ON public.custom_templates(created_by);
CREATE INDEX idx_custom_templates_approved ON public.custom_templates(is_approved);
CREATE INDEX idx_template_usage_template_id ON public.template_usage(template_id);
CREATE INDEX idx_template_usage_used_by ON public.template_usage(used_by);
CREATE INDEX idx_template_versions_template_id ON public.template_versions(template_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_templates_updated_at
BEFORE UPDATE ON public.custom_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();