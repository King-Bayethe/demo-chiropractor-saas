-- Create patient_conversations table
CREATE TABLE public.patient_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  ghl_conversation_id TEXT UNIQUE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  conversation_type TEXT NOT NULL DEFAULT 'sms',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_messages table
CREATE TABLE public.patient_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.patient_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'staff')),
  sender_id UUID,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  ghl_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_conversations
CREATE POLICY "Authenticated users can view patient conversations"
ON public.patient_conversations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create patient conversations"
ON public.patient_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update patient conversations"
ON public.patient_conversations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for patient_messages
CREATE POLICY "Authenticated users can view patient messages"
ON public.patient_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create patient messages"
ON public.patient_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_patient_conversations_patient_id ON public.patient_conversations(patient_id);
CREATE INDEX idx_patient_conversations_status ON public.patient_conversations(status);
CREATE INDEX idx_patient_conversations_last_message_at ON public.patient_conversations(last_message_at DESC);
CREATE INDEX idx_patient_messages_conversation_id ON public.patient_messages(conversation_id);
CREATE INDEX idx_patient_messages_created_at ON public.patient_messages(created_at DESC);

-- Create trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.patient_conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Create trigger to update unread count
CREATE OR REPLACE FUNCTION public.update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment unread count for patient messages
  IF NEW.sender_type = 'patient' THEN
    UPDATE public.patient_conversations
    SET unread_count = unread_count + 1
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_unread_count_trigger
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unread_count();

-- Enable realtime for both tables
ALTER TABLE public.patient_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.patient_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_messages;