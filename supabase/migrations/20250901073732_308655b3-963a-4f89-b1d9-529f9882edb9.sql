-- First, drop the problematic policy
DROP POLICY "Users can view all participants in shared chats" ON public.team_chat_participants;

-- Create a security definer function to check if user is participant in a chat
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_chat_participants
    WHERE chat_id = chat_id_param 
    AND user_id = user_id_param
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view participants in chats they belong to" 
ON public.team_chat_participants 
FOR SELECT 
USING (
  is_chat_participant(chat_id, auth.uid())
);