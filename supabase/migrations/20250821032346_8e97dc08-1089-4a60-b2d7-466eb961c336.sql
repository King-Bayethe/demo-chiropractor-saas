-- Fix security warnings by properly dropping triggers first, then functions

-- Drop triggers first
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.patient_messages;
DROP TRIGGER IF EXISTS update_unread_count_trigger ON public.patient_messages;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_conversation_last_message();
DROP FUNCTION IF EXISTS public.update_unread_count();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.patient_conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_unread_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment unread count for patient messages
  IF NEW.sender_type = 'patient' THEN
    UPDATE public.patient_conversations
    SET unread_count = unread_count + 1
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

CREATE TRIGGER update_unread_count_trigger
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_unread_count();