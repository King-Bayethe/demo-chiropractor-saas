-- Update IP whitelist policies to allow overlords to manage them
DROP POLICY IF EXISTS "Only admins can create IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can update IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can delete IP whitelist entries" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Only admins can view IP whitelist" ON public.ip_whitelist;

CREATE POLICY "Admins and overlords can create IP whitelist entries" 
ON public.ip_whitelist 
FOR INSERT 
WITH CHECK (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can update IP whitelist entries" 
ON public.ip_whitelist 
FOR UPDATE 
USING (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can delete IP whitelist entries" 
ON public.ip_whitelist 
FOR DELETE 
USING (get_current_user_role() IN ('admin', 'overlord'));

CREATE POLICY "Admins and overlords can view IP whitelist" 
ON public.ip_whitelist 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'overlord'));