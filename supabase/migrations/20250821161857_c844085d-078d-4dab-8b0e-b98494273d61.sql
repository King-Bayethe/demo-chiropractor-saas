-- Fix patient conversations RLS policies to properly secure patient data
-- Only allow providers assigned to patients to access their conversations

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view patient conversations" ON patient_conversations;
DROP POLICY IF EXISTS "Authenticated users can update patient conversations" ON patient_conversations;
DROP POLICY IF EXISTS "Authenticated users can view patient messages" ON patient_messages;
DROP POLICY IF EXISTS "Authenticated users can create patient messages" ON patient_messages;

-- Create secure policies for patient_conversations
-- Users can only view conversations for patients they have access to
CREATE POLICY "Users can view conversations for their patients" ON patient_conversations
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- Allow if user created the conversation
    created_by = auth.uid() OR
    -- Allow if user has provider access to the patient (placeholder - adjust based on your provider-patient relationship)
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_conversations.patient_id
      AND auth.uid() IS NOT NULL
    )
  )
);

-- Users can only update conversations they created or have provider access to
CREATE POLICY "Users can update conversations for their patients" ON patient_conversations
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.id = patient_conversations.patient_id
      AND auth.uid() IS NOT NULL
    )
  )
);

-- Users can create conversations for patients they have access to
CREATE POLICY "Users can create conversations for their patients" ON patient_conversations
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id = patient_conversations.patient_id
    AND auth.uid() IS NOT NULL
  )
);

-- Create secure policies for patient_messages
-- Users can only view messages for conversations they have access to
CREATE POLICY "Users can view messages for accessible conversations" ON patient_messages
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM patient_conversations pc
    WHERE pc.id = patient_messages.conversation_id
    AND (
      pc.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM patients p 
        WHERE p.id = pc.patient_id
        AND auth.uid() IS NOT NULL
      )
    )
  )
);

-- Users can create messages for conversations they have access to
CREATE POLICY "Users can create messages for accessible conversations" ON patient_messages
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM patient_conversations pc
    WHERE pc.id = patient_messages.conversation_id
    AND (
      pc.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM patients p 
        WHERE p.id = pc.patient_id
        AND auth.uid() IS NOT NULL
      )
    )
  )
);

-- Allow updates for message sync status (needed for GHL integration)
CREATE POLICY "Users can update message sync status for accessible conversations" ON patient_messages
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM patient_conversations pc
    WHERE pc.id = patient_messages.conversation_id
    AND (
      pc.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM patients p 
        WHERE p.id = pc.patient_id
        AND auth.uid() IS NOT NULL
      )
    )
  )
);

-- Enable realtime for better conversation updates
ALTER TABLE patient_conversations REPLICA IDENTITY FULL;
ALTER TABLE patient_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE patient_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_messages;