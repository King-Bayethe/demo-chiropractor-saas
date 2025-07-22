-- Ensure foreign key relationships are properly established
-- and fix the schema cache issue

-- Drop existing foreign keys if they exist (to recreate them properly)
ALTER TABLE team_chat_participants DROP CONSTRAINT IF EXISTS team_chat_participants_user_id_fkey;
ALTER TABLE team_messages DROP CONSTRAINT IF EXISTS team_messages_sender_id_fkey;

-- Add proper foreign key constraints with proper naming
ALTER TABLE team_chat_participants
ADD CONSTRAINT fk_team_chat_participants_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE team_messages
ADD CONSTRAINT fk_team_messages_profiles 
FOREIGN KEY (sender_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_chat_participants_user_id ON team_chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_id ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;