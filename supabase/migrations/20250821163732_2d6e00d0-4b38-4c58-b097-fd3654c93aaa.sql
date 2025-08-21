-- Create patient_providers table to establish provider-patient relationships
CREATE TABLE public.patient_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'primary_provider',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(user_id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, provider_id)
);

-- Enable RLS on patient_providers
ALTER TABLE public.patient_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_providers
CREATE POLICY "Providers can view their patient assignments"
  ON public.patient_providers
  FOR SELECT
  USING (auth.uid() = provider_id OR auth.uid() = assigned_by);

CREATE POLICY "Authenticated users can create patient assignments"
  ON public.patient_providers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Providers can update their patient assignments"
  ON public.patient_providers
  FOR UPDATE
  USING (auth.uid() = provider_id OR auth.uid() = assigned_by);

CREATE POLICY "Providers can deactivate their patient assignments"
  ON public.patient_providers
  FOR DELETE
  USING (auth.uid() = provider_id OR auth.uid() = assigned_by);

-- Drop existing problematic RLS policies for patient_conversations
DROP POLICY IF EXISTS "Authenticated users can create patient conversations" ON public.patient_conversations;
DROP POLICY IF EXISTS "Users can create conversations for their patients" ON public.patient_conversations;
DROP POLICY IF EXISTS "Users can update conversations for their patients" ON public.patient_conversations;
DROP POLICY IF EXISTS "Users can view conversations for their patients" ON public.patient_conversations;

-- Create new secure RLS policies for patient_conversations
CREATE POLICY "Providers can view conversations for assigned patients"
  ON public.patient_conversations
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.patient_providers pp
        WHERE pp.patient_id = patient_conversations.patient_id
        AND pp.provider_id = auth.uid()
        AND pp.is_active = true
      )
      OR auth.uid() = created_by
    )
  );

CREATE POLICY "Providers can create conversations for assigned patients"
  ON public.patient_conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.patient_providers pp
      WHERE pp.patient_id = patient_conversations.patient_id
      AND pp.provider_id = auth.uid()
      AND pp.is_active = true
    )
  );

CREATE POLICY "Providers can update conversations for assigned patients"
  ON public.patient_conversations
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.patient_providers pp
        WHERE pp.patient_id = patient_conversations.patient_id
        AND pp.provider_id = auth.uid()
        AND pp.is_active = true
      )
      OR auth.uid() = created_by
    )
  );

-- Drop existing problematic RLS policies for patient_messages
DROP POLICY IF EXISTS "Users can create messages for accessible conversations" ON public.patient_messages;
DROP POLICY IF EXISTS "Users can update message sync status for accessible conversatio" ON public.patient_messages;
DROP POLICY IF EXISTS "Users can view messages for accessible conversations" ON public.patient_messages;

-- Create new secure RLS policies for patient_messages
CREATE POLICY "Providers can view messages for assigned patient conversations"
  ON public.patient_messages
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.patient_conversations pc
      JOIN public.patient_providers pp ON pc.patient_id = pp.patient_id
      WHERE pc.id = patient_messages.conversation_id
      AND pp.provider_id = auth.uid()
      AND pp.is_active = true
    )
  );

CREATE POLICY "Providers can create messages for assigned patient conversations"
  ON public.patient_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.patient_conversations pc
      JOIN public.patient_providers pp ON pc.patient_id = pp.patient_id
      WHERE pc.id = patient_messages.conversation_id
      AND pp.provider_id = auth.uid()
      AND pp.is_active = true
    )
  );

CREATE POLICY "Providers can update messages for assigned patient conversations"
  ON public.patient_messages
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.patient_conversations pc
      JOIN public.patient_providers pp ON pc.patient_id = pp.patient_id
      WHERE pc.id = patient_messages.conversation_id
      AND pp.provider_id = auth.uid()
      AND pp.is_active = true
    )
  );

-- Create function to assign patient to provider
CREATE OR REPLACE FUNCTION public.assign_patient_to_provider(
  patient_id_param UUID,
  provider_id_param UUID,
  role_param TEXT DEFAULT 'primary_provider'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assignment_id UUID;
BEGIN
  -- Check if assignment already exists
  SELECT id INTO assignment_id
  FROM public.patient_providers
  WHERE patient_id = patient_id_param
  AND provider_id = provider_id_param;

  IF assignment_id IS NOT NULL THEN
    -- Update existing assignment to be active
    UPDATE public.patient_providers
    SET is_active = true, updated_at = now()
    WHERE id = assignment_id;
  ELSE
    -- Create new assignment
    INSERT INTO public.patient_providers (patient_id, provider_id, role, assigned_by)
    VALUES (patient_id_param, provider_id_param, role_param, auth.uid())
    RETURNING id INTO assignment_id;
  END IF;

  RETURN assignment_id;
END;
$$;

-- Create function to unassign patient from provider
CREATE OR REPLACE FUNCTION public.unassign_patient_from_provider(
  patient_id_param UUID,
  provider_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.patient_providers
  SET is_active = false, updated_at = now()
  WHERE patient_id = patient_id_param
  AND provider_id = provider_id_param;

  RETURN FOUND;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_patient_providers_updated_at
  BEFORE UPDATE ON public.patient_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();