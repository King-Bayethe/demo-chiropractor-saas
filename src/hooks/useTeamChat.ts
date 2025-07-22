import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatParticipant {
  id: string;
  name: string;
  email?: string;
  role?: 'staff' | 'admin' | 'doctor' | 'nurse' | 'overlord';
  is_admin: boolean;
}

export interface TeamChat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: ChatParticipant[];
  last_message_at?: string;
  created_by: string;
  created_at: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
  };
}

export const useTeamChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<TeamChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<TeamChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data: chatsData, error } = await supabase
        .from('team_chats')
        .select(`
          id,
          name,
          type,
          created_at,
          last_message_at,
          created_by,
          participants:team_chat_participants (
            user_id,
            name,
            is_admin
          )
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      const formattedChats = (chatsData || []).map((chat: any) => ({
        ...chat,
        participants: chat.participants.map((p: any) => ({ 
          id: p.user_id, 
          name: p.name || 'Unknown User',
          is_admin: p.is_admin 
        }))
      }));

      setChats(formattedChats);
      
      // Auto-select first chat if none selected
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
  }, [user?.id, selectedChat, toast]);

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      setMessagesLoading(true);
      const { data: messagesData, error } = await supabase
        .from('team_messages')
        .select('id, content, created_at, sender_id')
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, role')
            .eq('user_id', msg.sender_id)
            .maybeSingle();

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
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  const fetchProfiles = useCallback(async () => {
    try {
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
    }
  }, [toast]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !selectedChat?.id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          chat_id: selectedChat.id,
          content: message.trim(),
          sender_id: user.id
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

      const newMessage: ChatMessage = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        sender: {
          id: data.sender_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: profile?.email || '',
          role: profile?.role || 'staff'
        }
      };

      setMessages(prev => [...prev, newMessage]);

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
  }, [selectedChat, user?.id, toast]);

  const createChat = useCallback(async (memberIds: string[], groupName?: string) => {
    if (memberIds.length === 0 || !user?.id) return;

    try {
      const isGroupChat = memberIds.length > 1;
      
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('team_chats')
        .insert({
          type: isGroupChat ? 'group' : 'direct',
          name: isGroupChat ? (groupName || 'New Team Group') : null,
          created_by: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participantInserts = [
        { chat_id: chatData.id, user_id: user.id, is_admin: true },
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
  }, [user?.id, fetchChats, toast]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      // Delete messages first
      await supabase.from('team_messages').delete().eq('chat_id', chatId);
      
      // Delete participants
      await supabase.from('team_chat_participants').delete().eq('chat_id', chatId);
      
      // Delete chat
      await supabase.from('team_chats').delete().eq('id', chatId);

      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setSelectedChat(remainingChats[0] || null);
        setMessages([]);
      }

      toast({
        title: "Success",
        description: "Chat deleted successfully"
      });

    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive"
      });
    }
  }, [selectedChat, chats, toast]);

  const selectChat = useCallback((chat: TeamChat) => {
    setSelectedChat(chat);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchChats(), fetchProfiles()]);
    if (selectedChat?.id) {
      await fetchMessages(selectedChat.id);
    }
  }, [fetchChats, fetchProfiles, fetchMessages, selectedChat?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchChats();
      fetchProfiles();
    }
  }, [user?.id, fetchChats, fetchProfiles]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id, fetchMessages]);

  return {
    chats,
    selectedChat,
    messages,
    profiles,
    loading,
    messagesLoading,
    sendMessage,
    createChat,
    deleteChat,
    selectChat,
    refreshAll
  };
};