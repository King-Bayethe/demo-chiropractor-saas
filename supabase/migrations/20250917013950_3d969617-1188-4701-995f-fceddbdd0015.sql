-- Add 'demo' role to the existing role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['staff'::text, 'admin'::text, 'doctor'::text, 'nurse'::text, 'provider'::text, 'overlord'::text, 'demo'::text]));

-- Update the get_current_user_role function to handle demo role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(role, 'staff') FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Update RLS policies to handle demo role appropriately
-- Demo users should only see their own profile and not access sensitive data
CREATE POLICY "Demo users can only view their own profile" ON public.profiles
FOR SELECT USING (
  (auth.uid() = user_id) AND (get_current_user_role() = 'demo')
);

-- Demo users cannot access patient data, opportunities, etc. through direct DB queries
-- This ensures they only get data through the service layer
CREATE POLICY "Demo users cannot access real patient data" ON public.patients
FOR ALL USING (
  get_current_user_role() != 'demo'
);

CREATE POLICY "Demo users cannot access real opportunities" ON public.opportunities
FOR ALL USING (
  get_current_user_role() != 'demo'
);

CREATE POLICY "Demo users cannot access real appointments" ON public.appointments
FOR ALL USING (
  get_current_user_role() != 'demo'
);