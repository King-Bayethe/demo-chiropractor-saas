-- Clear current rate limit for your testing IP
DELETE FROM public.form_submission_rate_limits 
WHERE ip_address = '50.242.174.246'::inet;

-- Create IP whitelist table
CREATE TABLE public.ip_whitelist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL UNIQUE,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Only admins can manage IP whitelist
CREATE POLICY "Only admins can view IP whitelist" 
ON public.ip_whitelist 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can create IP whitelist entries" 
ON public.ip_whitelist 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update IP whitelist entries" 
ON public.ip_whitelist 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete IP whitelist entries" 
ON public.ip_whitelist 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Add your testing IP to whitelist
INSERT INTO public.ip_whitelist (ip_address, description, is_active)
VALUES ('50.242.174.246'::inet, 'Main testing computer', true);

-- Update rate limit check function to respect whitelist
CREATE OR REPLACE FUNCTION public.check_form_submission_rate_limit(
  client_ip inet, 
  form_type_param text, 
  max_submissions integer DEFAULT 5, 
  window_minutes integer DEFAULT 60
)
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
BEGIN
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
$function$;