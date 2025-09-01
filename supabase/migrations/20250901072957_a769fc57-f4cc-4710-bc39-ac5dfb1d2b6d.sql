-- Create a policy to allow viewing profiles of chat participants
-- This is needed for team chat functionality while maintaining security
CREATE POLICY "Users can view profiles of chat participants" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if user is a participant in the same chat as the profile owner
  EXISTS (
    SELECT 1 
    FROM team_chat_participants tcp1
    JOIN team_chat_participants tcp2 ON tcp1.chat_id = tcp2.chat_id
    WHERE tcp1.user_id = auth.uid()
    AND tcp2.user_id = profiles.user_id
  )
);