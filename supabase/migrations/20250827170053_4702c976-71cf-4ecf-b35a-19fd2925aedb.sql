-- Add function to check if user is overlord
CREATE OR REPLACE FUNCTION public.is_overlord()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role = 'overlord', false) FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update provider_availability RLS policies
DROP POLICY IF EXISTS "Users can create their own availability" ON public.provider_availability;
DROP POLICY IF EXISTS "Users can update their own availability" ON public.provider_availability;
DROP POLICY IF EXISTS "Users can delete their own availability" ON public.provider_availability;

CREATE POLICY "Users can create availability for themselves or overlords can create for anyone"
ON public.provider_availability
FOR INSERT
WITH CHECK (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));

CREATE POLICY "Users can update their own availability or overlords can update anyone's"
ON public.provider_availability
FOR UPDATE
USING (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));

CREATE POLICY "Users can delete their own availability or overlords can delete anyone's"
ON public.provider_availability
FOR DELETE
USING (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));

-- Update blocked_time_slots RLS policies
DROP POLICY IF EXISTS "Users can create their own availability" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "Users can update blocked slots they created" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "Users can delete blocked slots they created" ON public.blocked_time_slots;

CREATE POLICY "Users can create blocked slots for themselves or overlords can create for anyone"
ON public.blocked_time_slots
FOR INSERT
WITH CHECK (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));

CREATE POLICY "Users can update their own blocked slots or overlords can update anyone's"
ON public.blocked_time_slots
FOR UPDATE
USING (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));

CREATE POLICY "Users can delete their own blocked slots or overlords can delete anyone's"
ON public.blocked_time_slots
FOR DELETE
USING (auth.uid() = created_by AND (provider_id = auth.uid() OR is_overlord()));