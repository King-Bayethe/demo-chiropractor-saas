-- Fix security: Add search_path to function
DROP TRIGGER IF EXISTS trigger_update_conversation_on_sync ON public.patient_messages;
DROP FUNCTION IF EXISTS update_conversation_on_sync();

CREATE OR REPLACE FUNCTION update_conversation_on_sync()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update conversation when message is successfully synced
  IF NEW.sync_status = 'synced' AND OLD.sync_status != 'synced' THEN
    UPDATE public.patient_conversations
    SET 
      last_message_at = NEW.created_at,
      updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_conversation_on_sync
  AFTER UPDATE ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_sync();