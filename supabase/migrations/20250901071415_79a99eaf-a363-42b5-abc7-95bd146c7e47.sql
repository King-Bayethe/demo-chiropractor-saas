-- Fix search path for get_colleague_basic_info function
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
SET search_path = public
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