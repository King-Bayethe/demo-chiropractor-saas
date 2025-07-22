-- Enable real-time subscriptions for team chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_participants;

-- Set replica identity to full for complete row data
ALTER TABLE team_messages REPLICA IDENTITY FULL;
ALTER TABLE team_chats REPLICA IDENTITY FULL;
ALTER TABLE team_chat_participants REPLICA IDENTITY FULL;