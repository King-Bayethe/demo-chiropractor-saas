-- Drop existing restrictive RLS policies on opportunities table
DROP POLICY IF EXISTS "Users can view opportunities they created or are assigned to" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can create opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update opportunities they created or are assigned to" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can delete opportunities" ON public.opportunities;

-- Create new organization-wide access policies

-- Allow all authenticated users to view all opportunities
CREATE POLICY "All authenticated users can view opportunities" 
ON public.opportunities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to create opportunities
CREATE POLICY "All authenticated users can create opportunities" 
ON public.opportunities 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Allow all authenticated users to update any opportunity
CREATE POLICY "All authenticated users can update opportunities" 
ON public.opportunities 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Restrict delete to creators and admins only
CREATE POLICY "Creators and admins can delete opportunities" 
ON public.opportunities 
FOR DELETE 
USING ((auth.uid() = created_by) OR (get_current_user_role() = 'admin'::text));