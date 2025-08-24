-- Add security enhancements to form_submissions table
-- Add audit and security tracking columns
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS submission_source text DEFAULT 'web',
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS honeypot_field text,
ADD COLUMN IF NOT EXISTS submission_time_ms integer;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.form_submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  form_type text NOT NULL,
  submission_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.form_submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limits (only system can manage)
CREATE POLICY "Only authenticated users can view rate limits" 
ON public.form_submission_rate_limits 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create function to check rate limiting
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
BEGIN
  -- Calculate window start time
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.form_submission_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Check current rate limit
  SELECT COALESCE(submission_count, 0) 
  INTO current_count
  FROM public.form_submission_rate_limits 
  WHERE ip_address = client_ip 
    AND form_type = form_type_param 
    AND window_start >= window_start_time;
  
  -- If no record exists or within limit
  IF current_count IS NULL OR current_count < max_submissions THEN
    -- Insert or update rate limit record
    INSERT INTO public.form_submission_rate_limits (ip_address, form_type, submission_count, window_start)
    VALUES (client_ip, form_type_param, 1, now())
    ON CONFLICT (ip_address, form_type) 
    DO UPDATE SET 
      submission_count = form_submission_rate_limits.submission_count + 1,
      window_start = CASE 
        WHEN form_submission_rate_limits.window_start < window_start_time THEN now()
        ELSE form_submission_rate_limits.window_start
      END,
      updated_at = now();
    
    RETURN true;
  ELSE
    -- Rate limit exceeded
    UPDATE public.form_submission_rate_limits 
    SET blocked_until = now() + '1 hour'::interval,
        updated_at = now()
    WHERE ip_address = client_ip AND form_type = form_type_param;
    
    RETURN false;
  END IF;
END;
$$;

-- Create function to validate form submission
CREATE OR REPLACE FUNCTION public.validate_form_submission(
  form_data_param jsonb,
  form_type_param text,
  honeypot_value text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check honeypot field (should be empty)
  IF honeypot_value IS NOT NULL AND honeypot_value != '' THEN
    RETURN false;
  END IF;
  
  -- Validate required fields based on form type
  CASE form_type_param
    WHEN 'pip' THEN
      IF NOT (form_data_param ? 'patient_name' AND form_data_param ? 'patient_email') THEN
        RETURN false;
      END IF;
    WHEN 'lop' THEN
      IF NOT (form_data_param ? 'patient_name' AND form_data_param ? 'attorney_name') THEN
        RETURN false;
      END IF;
    WHEN 'cash' THEN
      IF NOT (form_data_param ? 'patient_name' AND form_data_param ? 'patient_phone') THEN
        RETURN false;
      END IF;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN true;
END;
$$;

-- Update the RLS policy for form submissions to include security checks
DROP POLICY IF EXISTS "Anyone can create form submissions" ON public.form_submissions;

CREATE POLICY "Secure form submissions with validation" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  -- Basic validation checks
  form_type IN ('pip', 'lop', 'cash') AND
  patient_name IS NOT NULL AND
  patient_name != '' AND
  form_data IS NOT NULL AND
  -- Honeypot check (honeypot_field should be empty)
  (honeypot_field IS NULL OR honeypot_field = '') AND
  -- Validate form structure
  validate_form_submission(form_data, form_type, honeypot_field)
);

-- Create audit log table for form submissions
CREATE TABLE IF NOT EXISTS public.form_submission_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_submission_id uuid REFERENCES public.form_submissions(id),
  event_type text NOT NULL, -- 'submitted', 'viewed', 'processed', 'flagged'
  event_details jsonb,
  ip_address inet,
  user_agent text,
  user_id uuid, -- If authenticated user performed action
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.form_submission_audit ENABLE ROW LEVEL SECURITY;

-- Only admins and staff can view audit logs
CREATE POLICY "Only admin/staff can view form audit logs" 
ON public.form_submission_audit 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'staff'::text]));

-- Create trigger to log form submissions
CREATE OR REPLACE FUNCTION public.log_form_submission_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.form_submission_audit (
    form_submission_id,
    event_type,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    NEW.id,
    'submitted',
    jsonb_build_object(
      'form_type', NEW.form_type,
      'patient_name', NEW.patient_name,
      'submission_source', NEW.submission_source
    ),
    NEW.ip_address,
    NEW.user_agent
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for form submission logging
DROP TRIGGER IF EXISTS form_submission_audit_trigger ON public.form_submissions;
CREATE TRIGGER form_submission_audit_trigger
  AFTER INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_form_submission_event();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_ip_address ON public.form_submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_form_type ON public.form_submission_rate_limits(ip_address, form_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.form_submission_rate_limits(window_start);