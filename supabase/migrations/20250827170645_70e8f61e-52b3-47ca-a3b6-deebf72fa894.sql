-- Create impersonation sessions table for audit trail
CREATE TABLE public.impersonation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  overlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  impersonated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Only overlords can view impersonation sessions
CREATE POLICY "Overlords can view all impersonation sessions"
ON public.impersonation_sessions
FOR SELECT
USING (is_overlord());

-- Only overlords can create impersonation sessions
CREATE POLICY "Overlords can create impersonation sessions"
ON public.impersonation_sessions
FOR INSERT
WITH CHECK (is_overlord() AND auth.uid() = overlord_id);

-- Only overlords can update their own impersonation sessions
CREATE POLICY "Overlords can update their own impersonation sessions"
ON public.impersonation_sessions
FOR UPDATE
USING (is_overlord() AND auth.uid() = overlord_id);

-- Add trigger for updated_at
CREATE TRIGGER update_impersonation_sessions_updated_at
BEFORE UPDATE ON public.impersonation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_impersonation_sessions_active ON public.impersonation_sessions(overlord_id, is_active) WHERE is_active = true;
CREATE INDEX idx_impersonation_sessions_user ON public.impersonation_sessions(impersonated_user_id);