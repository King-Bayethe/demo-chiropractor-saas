-- Add missing profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_signature text;

-- Create system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  description text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Authenticated users can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin', 'overlord']));

-- Create user_settings table for individual preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, category) VALUES
('default_timezone', '"America/New_York"', 'Default timezone for the system', 'general'),
('default_appointment_duration', '30', 'Default appointment duration in minutes', 'general'),
('business_hours_start', '"09:00"', 'Business day start time', 'general'),
('business_hours_end', '"17:00"', 'Business day end time', 'general'),
('auto_logout_timeout', '480', 'Auto logout timeout in minutes', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('password_require_uppercase', 'true', 'Require uppercase letters in passwords', 'security'),
('password_require_lowercase', 'true', 'Require lowercase letters in passwords', 'security'),
('password_require_numbers', 'true', 'Require numbers in passwords', 'security'),
('password_require_symbols', 'false', 'Require symbols in passwords', 'security'),
('session_timeout', '120', 'Session timeout in minutes', 'security'),
('max_failed_logins', '5', 'Maximum failed login attempts before lockout', 'security'),
('account_lockout_duration', '30', 'Account lockout duration in minutes', 'security'),
('data_retention_days', '2555', 'Data retention period in days (7 years)', 'compliance')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();