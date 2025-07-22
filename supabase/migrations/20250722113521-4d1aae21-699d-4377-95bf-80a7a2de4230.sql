-- Add foreign key relationship between team_chat_participants and profiles
ALTER TABLE team_chat_participants
ADD CONSTRAINT team_chat_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Add foreign key relationship between team_messages and profiles
ALTER TABLE team_messages
ADD CONSTRAINT team_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(user_id);