-- Drop the restrictive policy that's causing issues
DROP POLICY "Users can view profiles of chat participants" ON public.profiles;

-- Create a more permissive policy specifically for team chat functionality
-- This allows viewing profile info when accessed through team_chat_participants join
CREATE POLICY "Team chat participants can view each other" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if the profile is being accessed in the context of team chat participants
  -- where the requesting user is also a participant in the same chat
  EXISTS (
    SELECT 1 
    FROM team_chat_participants tcp_current
    WHERE tcp_current.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 
      FROM team_chat_participants tcp_target
      WHERE tcp_target.user_id = profiles.user_id
      AND tcp_target.chat_id = tcp_current.chat_id
    )
  )
);