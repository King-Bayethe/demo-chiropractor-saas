-- Enhance patient_messages table for better GHL sync
ALTER TABLE public.patient_messages 
ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ghl_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ghl_delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ghl_read_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at timestamp with time zone;

-- Add indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_patient_messages_ghl_message_id ON public.patient_messages(ghl_message_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_sync_status ON public.patient_messages(sync_status);
CREATE INDEX IF NOT EXISTS idx_patient_conversations_ghl_id ON public.patient_conversations(ghl_conversation_id);

-- Update sync_status constraint
ALTER TABLE public.patient_messages 
ADD CONSTRAINT check_sync_status 
CHECK (sync_status IN ('pending', 'synced', 'failed', 'skipped'));

-- Add trigger to update conversation last_message_at when messages are synced
CREATE OR REPLACE FUNCTION update_conversation_on_sync()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_sync
  AFTER UPDATE ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_sync();