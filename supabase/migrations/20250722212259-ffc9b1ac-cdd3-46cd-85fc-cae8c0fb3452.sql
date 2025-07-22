-- Add archived_at column to team_messages table for soft deletion
ALTER TABLE public.team_messages 
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add archived_at column to team_chats table for soft deletion  
ALTER TABLE public.team_chats
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add archived_at column to team_chat_participants table for soft deletion
ALTER TABLE public.team_chat_participants
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for performance on archived_at columns
CREATE INDEX idx_team_messages_archived_at ON public.team_messages(archived_at);
CREATE INDEX idx_team_chats_archived_at ON public.team_chats(archived_at);
CREATE INDEX idx_team_chat_participants_archived_at ON public.team_chat_participants(archived_at);

-- Update RLS policies to exclude archived messages by default
DROP POLICY IF EXISTS "Users can view messages in chats they participate in" ON public.team_messages;
CREATE POLICY "Users can view non-archived messages in chats they participate in" 
ON public.team_messages 
FOR SELECT 
USING (
  archived_at IS NULL AND 
  EXISTS (
    SELECT 1
    FROM team_chat_participants
    WHERE team_chat_participants.chat_id = team_messages.chat_id 
    AND team_chat_participants.user_id = auth.uid()
    AND team_chat_participants.archived_at IS NULL
  )
);

-- Update RLS policies to exclude archived chats by default
DROP POLICY IF EXISTS "Users can view chats they're in or created" ON public.team_chats;
CREATE POLICY "Users can view non-archived chats they're in or created" 
ON public.team_chats 
FOR SELECT 
USING (
  archived_at IS NULL AND (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1
      FROM team_chat_participants
      WHERE team_chat_participants.chat_id = team_chats.id 
      AND team_chat_participants.user_id = auth.uid()
      AND team_chat_participants.archived_at IS NULL
    )
  )
);

-- Update RLS policies to exclude archived participants by default
DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON public.team_chat_participants;
CREATE POLICY "Users can view non-archived participants of chats they're in" 
ON public.team_chat_participants 
FOR SELECT 
USING (
  archived_at IS NULL AND 
  EXISTS (
    SELECT 1
    FROM team_chat_participants tcp2
    WHERE tcp2.chat_id = team_chat_participants.chat_id 
    AND tcp2.user_id = auth.uid()
    AND tcp2.archived_at IS NULL
  )
);

-- Allow users to archive their own messages
CREATE POLICY "Users can archive their own messages" 
ON public.team_messages 
FOR UPDATE 
USING (auth.uid() = sender_id AND archived_at IS NULL)
WITH CHECK (auth.uid() = sender_id);

-- Allow chat creators and admins to archive chats and participants
CREATE POLICY "Chat creators and admins can archive chats" 
ON public.team_chats 
FOR UPDATE 
USING (
  archived_at IS NULL AND (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1
      FROM team_chat_participants
      WHERE team_chat_participants.chat_id = team_chats.id 
      AND team_chat_participants.user_id = auth.uid() 
      AND team_chat_participants.is_admin = true
      AND team_chat_participants.archived_at IS NULL
    )
  )
);