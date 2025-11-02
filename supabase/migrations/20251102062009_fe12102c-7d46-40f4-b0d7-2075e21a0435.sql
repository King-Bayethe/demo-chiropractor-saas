-- Migration 1: Add Secure Role-Based Access Control System
-- This migration fixes critical privilege escalation vulnerability by implementing
-- a separate user_roles table with proper SECURITY DEFINER functions

-- Step 1: Create app_role enum with valid roles
CREATE TYPE public.app_role AS ENUM (
  'staff',
  'admin',
  'doctor',
  'nurse',
  'provider',
  'overlord',
  'demo'
);

-- Step 2: Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create performance index
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_user_roles_role ON public.user_roles(role) WHERE is_active = true;

-- Step 5: Create secure function to check if user has a specific role
-- SECURITY DEFINER bypasses RLS, preventing recursive policy issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

-- Step 6: Create function to get user's primary role (highest priority)
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'overlord' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'doctor' THEN 3
      WHEN 'nurse' THEN 4
      WHEN 'provider' THEN 5
      WHEN 'staff' THEN 6
      WHEN 'demo' THEN 7
    END
  LIMIT 1;
$$;

-- Step 7: Replace get_current_user_role with secure version
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_user_primary_role(auth.uid())::text,
    'staff'
  );
$$;

-- Step 8: Update is_overlord function to use new system
CREATE OR REPLACE FUNCTION public.is_overlord()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'overlord');
$$;

-- Step 9: Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at, is_active)
SELECT 
  user_id,
  role::public.app_role,
  created_at,
  is_active
FROM public.profiles
WHERE role IS NOT NULL
  AND role IN ('staff', 'admin', 'doctor', 'nurse', 'provider', 'overlord', 'demo')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 10: Mark profiles.role as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. Kept for backward compatibility only. This column should not be used for authorization checks.';

-- Step 11: Create RLS policies for user_roles table

-- Policy 1: Admins and overlords can view all user roles
CREATE POLICY "Admins and overlords can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'overlord')
);

-- Policy 2: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Only overlords can insert user roles
CREATE POLICY "Overlords can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'overlord'));

-- Policy 4: Only overlords can update user roles
CREATE POLICY "Overlords can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'overlord'));

-- Policy 5: Only overlords can delete user roles
CREATE POLICY "Overlords can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'overlord'));

-- Step 12: Add trigger to update updated_at timestamp
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();