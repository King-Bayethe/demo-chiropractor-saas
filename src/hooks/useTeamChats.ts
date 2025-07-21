import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ChatType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
}

export interface TeamChat {
  id: string;
  name?: string;
  type: ChatType;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: Profile[];
  unread_count?: number;
  last_message?: {
    content: string;
    sender: Profile;
  };
}

export interface TeamMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  sender?: Profile;
}

export const useTeamChats = () => {
  const [chats, setChats] = useState<TeamChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<TeamChat | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  // Fetch all team members/profiles
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    }
  };

  // Fetch user's chats with participants and last message
  const fetchChats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // First get the chats the user participates in
      const { data: participantChats, error: participantError } = await supabase
        .from('team_chat_participants')
        .select('chat_id')
        .eq('user_id', user.user.id);

      if (participantError) throw participantError;

      if (!participantChats?.length) {
        setChats([]);
        return;
      }

      const chatIds = participantChats.map(p => p.chat_id);

      // Get the chats with basic info
      const { data: chatsData, error: chatsError } = await supabase
        .from('team_chats')
        .select('*')
        .in('id', chatIds)
        .order('last_message_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Process each chat to get participants, last message, and unread count
      const processedChats = await Promise.all((chatsData || []).map(async (chat) => {
        // Get participants for this chat
        const { data: participantIds } = await supabase
          .from('team_chat_participants')
          .select('user_id, last_read_at')
          .eq('chat_id', chat.id);

        // Get profiles for participants
        const participantUserIds = participantIds?.map(p => p.user_id) || [];
        const { data: participantProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', participantUserIds);

        // Get last message with sender info
        const { data: lastMessage } = await supabase
          .from('team_messages')
          .select('content, created_at, sender_id')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let lastMessageWithSender;
        if (lastMessage) {
          const senderProfile = participantProfiles?.find(p => p.user_id === lastMessage.sender_id);
          if (senderProfile) {
            lastMessageWithSender = {
              content: lastMessage.content,
              sender: senderProfile
            };
          }
        }

        // Get unread count
        const currentParticipant = participantIds?.find(p => p.user_id === user.user?.id);
        const lastReadAt = currentParticipant?.last_read_at || chat.created_at;
        
        const { count } = await supabase
          .from('team_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .gt('created_at', lastReadAt);

        return {
          ...chat,
          participants: participantProfiles || [],
          unread_count: count || 0,
          last_message: lastMessageWithSender
        };
      }));

      setChats(processedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('team_messages')
        .select('*')
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles for messages
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', senderIds);

      const messagesWithSenders = messagesData?.map(msg => ({
        ...msg,
        sender: senderProfiles?.find(p => p.user_id === msg.sender_id)
      })) || [];

      setMessages(messagesWithSenders);

      // Mark messages as read
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('team_chat_participants')
          .update({ last_read_at: new Date().toISOString() })
          .eq('chat_id', chatId)
          .eq('user_id', user.user.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  // Create a new direct chat
  const createDirectChat = async (participantId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Check if direct chat already exists between these two users
      const { data: existingParticipants } = await supabase
        .from('team_chat_participants')
        .select('chat_id')
        .in('user_id', [user.user.id, participantId]);

      // Find chats where both users participate
      const chatParticipantCounts = existingParticipants?.reduce((acc: Record<string, number>, p) => {
        acc[p.chat_id] = (acc[p.chat_id] || 0) + 1;
        return acc;
      }, {});

      const existingChatId = Object.keys(chatParticipantCounts || {}).find(
        chatId => chatParticipantCounts[chatId] === 2
      );

      if (existingChatId) {
        // Check if this is a direct chat
        const { data: existingChat } = await supabase
          .from('team_chats')
          .select('*')
          .eq('id', existingChatId)
          .eq('type', 'direct')
          .single();

        if (existingChat) {
          const fullChat = chats.find(c => c.id === existingChat.id);
          if (fullChat) {
            setSelectedChat(fullChat);
            fetchMessages(fullChat.id);
            return fullChat;
          }
        }
      }

      // Create new direct chat
      const { data: newChat, error: chatError } = await supabase
        .from('team_chats')
        .insert({
          type: 'direct',
          created_by: user.user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('team_chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: user.user.id },
          { chat_id: newChat.id, user_id: participantId }
        ]);

      if (participantsError) throw participantsError;

      await fetchChats();
      const createdChat = chats.find(c => c.id === newChat.id);
      if (createdChat) {
        setSelectedChat(createdChat);
        fetchMessages(createdChat.id);
      }

      return newChat;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  // Send a message
  const sendMessage = async (content: string, chatId?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const targetChatId = chatId || selectedChat?.id;
      if (!targetChatId) throw new Error('No chat selected');

      const { error } = await supabase
        .from('team_messages')
        .insert({
          chat_id: targetChatId,
          sender_id: user.user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Refresh messages and chats
      await fetchMessages(targetChatId);
      await fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchProfiles(), fetchChats()]);
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  return {
    chats,
    selectedChat,
    setSelectedChat,
    messages,
    profiles,
    loading,
    createDirectChat,
    sendMessage,
    fetchChats,
    fetchMessages
  };
};