-- Fix the RLS policy for notifications table to properly allow authenticated users to create notifications
-- The current policy only checks if user is authenticated, but we need to ensure they can only set created_by to their own ID

DROP POLICY IF EXISTS "Authenticated users can create notifications for others" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications for others" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (created_by IS NULL OR created_by = auth.uid())
);