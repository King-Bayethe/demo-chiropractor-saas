-- Update the rate limiting function to bypass for overlords
CREATE OR REPLACE FUNCTION public.check_form_submission_rate_limit(client_ip inet, form_type_param text, max_submissions integer DEFAULT 5, window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
  existing_record_id uuid;
  is_whitelisted boolean := false;
  is_overlord_user boolean := false;
BEGIN
  -- Check if current user is an overlord
  SELECT is_overlord() INTO is_overlord_user;
  
  -- If user is overlord, always allow submission
  IF is_overlord_user THEN
    RETURN true;
  END IF;
  
  -- Check if IP is whitelisted
  SELECT EXISTS(
    SELECT 1 FROM public.ip_whitelist 
    WHERE ip_address = client_ip AND is_active = true
  ) INTO is_whitelisted;
  
  -- If IP is whitelisted, always allow submission
  IF is_whitelisted THEN
    RETURN true;
  END IF;
  
  -- Calculate window start time
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.form_submission_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Check for existing record
  SELECT id, COALESCE(submission_count, 0) 
  INTO existing_record_id, current_count
  FROM public.form_submission_rate_limits 
  WHERE ip_address = client_ip 
    AND form_type = form_type_param 
    AND window_start >= window_start_time
  LIMIT 1;
  
  -- If no record exists or within limit
  IF existing_record_id IS NULL THEN
    -- Create new record
    INSERT INTO public.form_submission_rate_limits (ip_address, form_type, submission_count, window_start)
    VALUES (client_ip, form_type_param, 1, now());
    RETURN true;
  ELSIF current_count < max_submissions THEN
    -- Update existing record
    UPDATE public.form_submission_rate_limits 
    SET submission_count = submission_count + 1,
        updated_at = now()
    WHERE id = existing_record_id;
    RETURN true;
  ELSE
    -- Rate limit exceeded
    UPDATE public.form_submission_rate_limits 
    SET blocked_until = now() + '1 hour'::interval,
        updated_at = now()
    WHERE id = existing_record_id;
    RETURN false;
  END IF;
END;
$function$

-- Create a function to automatically whitelist overlord IPs
CREATE OR REPLACE FUNCTION public.auto_whitelist_overlord_ip()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a user's profile is updated to overlord role, we could potentially
  -- whitelist their known IPs, but this would require tracking user IPs
  -- For now, overlords are handled in the rate limit function directly
  RETURN NEW;
END;
$function$

-- Update IP whitelist policies to allow overlords to manage them
DROP POLICY IF EXISTS "Only admins can create IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can update IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can delete IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can view IP whitelist" ON public.ip_whitelist;

CREATE POLICY "Admins and overlords can create IP whitelist entries" 
ON public.ip_whitelist 
FOR INSERT 
WITH CHECK (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can update IP whitelist entries" 
ON public.ip_whitelist 
FOR UPDATE 
USING (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can delete IP whitelist entries" 
ON public.ip_whitelist 
FOR DELETE 
USING (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can view IP whitelist" 
ON public.ip_whitelist 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'overlord'));