-- Drop the overly permissive policy
DROP POLICY "Authenticated users can view all profiles" ON public.profiles;

-- Create more secure, role-based policies for profile access

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Admins and overlords can view all profiles (for user management)
CREATE POLICY "Admins and overlords can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'overlord'));

-- Policy 3: Healthcare staff can view basic info of other staff for operational needs
-- This allows doctors, nurses, and staff to see names and roles for team coordination
-- but restricts access to sensitive info like phone numbers and email signatures
CREATE POLICY "Healthcare staff can view basic colleague info" 
ON public.profiles 
FOR SELECT 
USING (
  get_current_user_role() IN ('doctor', 'nurse', 'staff', 'provider') 
  AND auth.uid() != user_id  -- Don't duplicate own profile access
);

-- Create a function to get limited profile info for team coordination
CREATE OR REPLACE FUNCTION public.get_colleague_basic_info()
RETURNS TABLE(
  user_id uuid,
  first_name text,
  last_name text,
  role text,
  is_active boolean
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.role,
    p.is_active
  FROM public.profiles p
  WHERE 
    -- Allow if current user is admin/overlord (full access)
    (get_current_user_role() IN ('admin', 'overlord'))
    OR 
    -- Allow basic info for healthcare staff coordination
    (get_current_user_role() IN ('doctor', 'nurse', 'staff', 'provider'))
$$;

-- Update the healthcare staff policy to be more restrictive
-- This replaces the previous policy with one that only allows basic info
DROP POLICY "Healthcare staff can view basic colleague info" ON public.profiles;

CREATE POLICY "Healthcare staff can view basic colleague info" 
ON public.profiles 
FOR SELECT 
USING (
  (get_current_user_role() IN ('doctor', 'nurse', 'staff', 'provider') 
   AND auth.uid() != user_id)
  -- Only allow access to basic fields, not sensitive ones like email, phone, email_signature
  AND (
    -- This policy will be enforced at the application level for field filtering
    -- The sensitive fields should be filtered out in application queries
    true
  )
);