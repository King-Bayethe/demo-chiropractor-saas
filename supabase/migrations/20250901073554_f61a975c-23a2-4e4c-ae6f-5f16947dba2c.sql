-- Fix the team_chat_participants RLS policy to allow viewing all participants
-- in chats where the current user is also a participant

-- Drop existing restrictive policies
DROP POLICY "Users can view non-archived participants of chats they're in" ON public.team_chat_participants;
DROP POLICY "Users can view participants of chats they are in" ON public.team_chat_participants;

-- Create new policy that allows viewing all participants in chats you're part of
CREATE POLICY "Users can view all participants in shared chats" 
ON public.team_chat_participants 
FOR SELECT 
USING (
  -- Allow viewing participants in chats where the current user is also a participant
  EXISTS (
    SELECT 1 
    FROM team_chat_participants my_participation
    WHERE my_participation.user_id = auth.uid()
    AND my_participation.chat_id = team_chat_participants.chat_id
  )
);