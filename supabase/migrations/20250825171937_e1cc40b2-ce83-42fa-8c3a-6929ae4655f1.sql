-- Fix rate limiting function to work with existing table structure
CREATE OR REPLACE FUNCTION public.check_form_submission_rate_limit(
  client_ip inet, 
  form_type_param text, 
  max_submissions integer DEFAULT 5, 
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
  existing_record_id uuid;
BEGIN
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
$$;