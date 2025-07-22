import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatLayout } from "./chat/ChatLayout";
import { NewChatDialog } from "./chat/NewChatDialog";

export const TeamChatSection = () => {
  const { toast } = useToast();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  // Fetch chats
  // Fetch chats
  const fetchChats = async () => {
    if (!currentUserId) return;

    try {
      // This single query fetches all necessary data at once.
      // 1. It finds all chats the current user is a participant in.
      // 2. For each of those chats, it fetches all details about the chat itself.
      // 3. It also fetches a complete list of participants for each chat, including their full profiles.
      const { data: chatParticipants, error: chatsError } = await supabase
        .from('team_chat_participants')
        .select(`
          team_chats (
            id,
            name,
            type,
            created_at,
            last_message_at,
            created_by,
            participants:team_chat_participants (
              user_id,
              is_admin,
              profiles (
                first_name,
                last_name,
                email,
                role
              )
            )
          )
        `)
        .eq('user_id', currentUserId)
        .order('last_message_at', { referencedTable: 'team_chats', ascending: false, nullsFirst: false });

      if (chatsError) throw chatsError;

      // The query returns a structured list that's easy to work with.
      const formattedChats = (chatParticipants || []).map((p: any) => ({
        ...p.team_chats,
        participants: p.team_chats.participants.map((participant: any) => ({
            id: participant.user_id,
            ...participant.profiles,
            is_admin: participant.is_admin
        }))
      }));
      
      setChats(formattedChats);
      if (formattedChats.length > 0 && !selectedChat) {
        setSelectedChat(formattedChats[0]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('team_messages')
        .select('id, content, created_at, sender_id')
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch sender profiles for each message
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, role')
            .eq('user_id', msg.sender_id)
            .maybeSingle();

          if (profileError) {
            console.warn('Profile not found for sender:', msg.sender_id);
          }

          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: {
              id: msg.sender_id,
              first_name: profile?.first_name || '',
              last_name: profile?.last_name || '',
              email: profile?.email || '',
              role: profile?.role || 'staff'
            }
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error", 
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchChats();
      fetchProfiles();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedChat?.id || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          chat_id: selectedChat.id,
          content: message.trim(),
          sender_id: currentUserId
        })
        .select('id, content, created_at, sender_id')
        .single();

      if (error) throw error;

      // Fetch sender profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, role')
        .eq('user_id', data.sender_id)
        .maybeSingle();

      const newMsg = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        sender: {
          id: data.sender_id,
          first_name: profile?.first_name || 'You',
          last_name: profile?.last_name || '',
          email: profile?.email || '',
          role: profile?.role || 'staff'
        }
      };

      setMessages(prev => [...prev, newMsg]);

      // Update chat's last_message_at
      await supabase
        .from('team_chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedChat.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const createNewChat = async (memberIds: string[], groupName?: string) => {
    if (memberIds.length === 0 || !currentUserId) return;

    try {
      const isGroupChat = memberIds.length > 1;
      
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('team_chats')
        .insert({
          type: isGroupChat ? 'group' : 'direct',
          name: isGroupChat ? (groupName || 'New Medical Team Group') : null,
          created_by: currentUserId
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participantInserts = [
        { chat_id: chatData.id, user_id: currentUserId, is_admin: true },
        ...memberIds.map(memberId => ({
          chat_id: chatData.id,
          user_id: memberId,
          is_admin: false
        }))
      ];

      const { error: participantsError } = await supabase
        .from('team_chat_participants')
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      // Refresh chats
      await fetchChats();

      toast({
        title: "Success",
        description: `${isGroupChat ? 'Group chat' : 'Direct chat'} created successfully`
      });

    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      // Delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('team_messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) throw messagesError;

      // Delete all participants
      const { error: participantsError } = await supabase
        .from('team_chat_participants')
        .delete()
        .eq('chat_id', chatId);

      if (participantsError) throw participantsError;

      // Delete the chat
      const { error: chatError } = await supabase
        .from('team_chats')
        .delete()
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setSelectedChat(remainingChats[0] || null);
        setMessages([]);
      }

      toast({
        title: "Success",
        description: "Conversation deleted successfully"
      });

    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchChats(),
      fetchProfiles()
    ]);
    
    if (selectedChat?.id) {
      await fetchMessages(selectedChat.id);
    }
  };

  return (
    <>
      <ChatLayout
        chats={chats}
        selectedChat={selectedChat}
        messages={messages}
        currentUserId={currentUserId}
        onSelectChat={setSelectedChat}
        onSendMessage={handleSendMessage}
        onCreateChat={() => setIsNewChatOpen(true)}
        onDeleteChat={deleteChat}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        profiles={profiles}
        currentUserId={currentUserId}
        onCreateChat={createNewChat}
        loading={profilesLoading}
        onRefreshProfiles={fetchProfiles}
      />
    </>
  );
};