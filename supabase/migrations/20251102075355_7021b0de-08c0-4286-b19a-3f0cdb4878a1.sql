-- Create pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pipeline_stages table
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_closed_won BOOLEAN NOT NULL DEFAULT false,
  is_closed_lost BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pipeline_id, position)
);

-- Add pipeline_id and pipeline_stage_id to opportunities table
ALTER TABLE public.opportunities 
  ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES public.pipelines(id),
  ADD COLUMN IF NOT EXISTS pipeline_stage_id UUID REFERENCES public.pipeline_stages(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pipelines_created_by ON public.pipelines(created_by);
CREATE INDEX IF NOT EXISTS idx_pipelines_organization_id ON public.pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON public.pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline_id ON public.opportunities(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline_stage_id ON public.opportunities(pipeline_stage_id);

-- Enable RLS
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipelines
CREATE POLICY "Users can view their organization pipelines"
  ON public.pipelines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create pipelines"
  ON public.pipelines FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update pipelines they created"
  ON public.pipelines FOR UPDATE
  USING (auth.uid() = created_by OR get_current_user_role() = ANY(ARRAY['admin'::text, 'overlord'::text]));

CREATE POLICY "Users can delete pipelines they created"
  ON public.pipelines FOR DELETE
  USING (auth.uid() = created_by OR get_current_user_role() = ANY(ARRAY['admin'::text, 'overlord'::text]));

-- RLS Policies for pipeline_stages
CREATE POLICY "Users can view pipeline stages"
  ON public.pipeline_stages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create stages for their pipelines"
  ON public.pipeline_stages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id 
      AND (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin'::text, 'overlord'::text]))
    )
  );

CREATE POLICY "Users can update stages for their pipelines"
  ON public.pipeline_stages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id 
      AND (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin'::text, 'overlord'::text]))
    )
  );

CREATE POLICY "Users can delete stages for their pipelines"
  ON public.pipeline_stages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines 
      WHERE id = pipeline_id 
      AND (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin'::text, 'overlord'::text]))
    )
  );

-- Create default "Medical Care Pipeline" with stages
DO $$
DECLARE
  v_pipeline_id UUID;
  v_user_id UUID;
BEGIN
  -- Get first user as creator (or use a system user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Create default pipeline
    INSERT INTO public.pipelines (name, description, is_default, is_active, created_by)
    VALUES ('Medical Care Pipeline', 'Default pipeline for patient journey from lead to treatment', true, true, v_user_id)
    RETURNING id INTO v_pipeline_id;

    -- Create stages
    INSERT INTO public.pipeline_stages (pipeline_id, name, description, color, position, is_closed_won, is_closed_lost) VALUES
    (v_pipeline_id, 'Lead', 'Initial contact or inquiry', 'bg-blue-500', 1, false, false),
    (v_pipeline_id, 'Consultation Scheduled', 'First appointment booked', 'bg-cyan-500', 2, false, false),
    (v_pipeline_id, 'Consultation Completed', 'Initial consultation done', 'bg-purple-500', 3, false, false),
    (v_pipeline_id, 'Treatment Plan Proposed', 'Treatment plan presented to patient', 'bg-indigo-500', 4, false, false),
    (v_pipeline_id, 'Treatment Approved', 'Patient approved treatment plan', 'bg-green-500', 5, false, false),
    (v_pipeline_id, 'In Treatment', 'Patient actively receiving treatment', 'bg-emerald-500', 6, false, false),
    (v_pipeline_id, 'Discharged', 'Treatment completed successfully', 'bg-teal-500', 7, true, false);

    -- Migrate existing opportunities to default pipeline
    UPDATE public.opportunities
    SET pipeline_id = v_pipeline_id,
        pipeline_stage_id = (
          SELECT ps.id 
          FROM public.pipeline_stages ps 
          WHERE ps.pipeline_id = v_pipeline_id 
          AND ps.name = CASE 
            WHEN opportunities.pipeline_stage = 'lead' THEN 'Lead'
            WHEN opportunities.pipeline_stage = 'consultation-scheduled' THEN 'Consultation Scheduled'
            WHEN opportunities.pipeline_stage = 'consultation-completed' THEN 'Consultation Completed'
            WHEN opportunities.pipeline_stage = 'treatment-plan-proposed' THEN 'Treatment Plan Proposed'
            WHEN opportunities.pipeline_stage = 'treatment-approved' THEN 'Treatment Approved'
            WHEN opportunities.pipeline_stage = 'in-treatment' THEN 'In Treatment'
            WHEN opportunities.pipeline_stage = 'discharged' THEN 'Discharged'
            ELSE 'Lead'
          END
          LIMIT 1
        )
    WHERE pipeline_id IS NULL;
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pipeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_updated_at();

CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_updated_at();