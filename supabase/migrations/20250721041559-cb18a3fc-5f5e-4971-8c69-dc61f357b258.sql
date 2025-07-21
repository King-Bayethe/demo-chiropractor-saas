-- Create enum for message types
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'file', 'system');

-- Create enum for chat types
CREATE TYPE public.chat_type AS ENUM ('direct', 'group');

-- Create profiles table for team members (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_chats table
CREATE TABLE public.team_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, -- null for direct chats, required for group chats
  type chat_type NOT NULL DEFAULT 'direct',
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_chat_participants table
CREATE TABLE public.team_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.team_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN DEFAULT false,
  UNIQUE(chat_id, user_id)
);

-- Create team_messages table
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.team_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  reply_to_id UUID REFERENCES public.team_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for team_chats
CREATE POLICY "Users can view chats they participate in"
ON public.team_chats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats"
ON public.team_chats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat admins can update chats"
ON public.team_chats FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = id AND user_id = auth.uid() AND is_admin = true
  ) OR created_by = auth.uid()
);

-- RLS Policies for team_chat_participants
CREATE POLICY "Users can view participants of chats they're in"
ON public.team_chat_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_chat_participants p2
    WHERE p2.chat_id = chat_id AND p2.user_id = auth.uid()
  )
);

CREATE POLICY "Chat creators and admins can add participants"
ON public.team_chat_participants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_chats
    WHERE id = chat_id AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = team_chat_participants.chat_id AND user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can leave chats or admins can remove participants"
ON public.team_chat_participants FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = team_chat_participants.chat_id AND user_id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for team_messages
CREATE POLICY "Users can view messages in chats they participate in"
ON public.team_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = team_messages.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to chats they participate in"
ON public.team_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = team_messages.chat_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.team_messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages or admins can delete any"
ON public.team_messages FOR DELETE
TO authenticated
USING (
  auth.uid() = sender_id OR
  EXISTS (
    SELECT 1 FROM public.team_chat_participants
    WHERE chat_id = team_messages.chat_id AND user_id = auth.uid() AND is_admin = true
  )
);

-- Create indexes for performance
CREATE INDEX idx_team_chats_participants ON public.team_chat_participants(chat_id, user_id);
CREATE INDEX idx_team_messages_chat_id ON public.team_messages(chat_id, created_at DESC);
CREATE INDEX idx_team_chats_last_message ON public.team_chats(last_message_at DESC);

-- Create function to update last_message_at when new message is sent
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.team_chats
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last_message_at
CREATE TRIGGER update_team_chat_last_message
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_last_message();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_chats_updated_at
  BEFORE UPDATE ON public.team_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();