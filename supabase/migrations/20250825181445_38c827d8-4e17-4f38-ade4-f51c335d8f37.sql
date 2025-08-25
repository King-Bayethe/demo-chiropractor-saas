-- Update the SELECT policy to include overlord role
DROP POLICY IF EXISTS "Only admins and staff can view form submissions" ON form_submissions;
CREATE POLICY "Only admins and staff can view form submissions" 
  ON form_submissions 
  FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'staff'::text, 'provider'::text, 'overlord'::text]));

-- Update the UPDATE policy to include overlord role  
DROP POLICY IF EXISTS "Authenticated users can update form submissions" ON form_submissions;
CREATE POLICY "Authenticated users can update form submissions" 
  ON form_submissions 
  FOR UPDATE 
  USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'staff'::text, 'provider'::text, 'overlord'::text]));