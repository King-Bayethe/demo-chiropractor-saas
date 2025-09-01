import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationHelpers } from "@/hooks/useNotificationHelpers";
import { ChatLayout } from "./chat/ChatLayout";
import { NewChatDialog } from "./chat/NewChatDialog";

export const TeamChatSection = () => {
  const { toast } = useToast();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const { notifyNewMessage, notifyNewChat } = useNotificationHelpers();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const currentUserId = currentUser?.id || null;

  // Fetch chats
  const fetchChats = async () => {
    if (!currentUserId) return;
    
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('team_chats')
        .select(`
          id,
          name,
          type,
          created_at,
          last_message_at,
          created_by
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Fetch participants with profiles for each chat
      const chatsWithData = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Get participants with their profiles - updated for new RLS policies
          const { data: participants, error: participantsError } = await supabase
            .from('team_chat_participants')
            .select(`
              user_id,
              is_admin,
              profiles(
                first_name,
                last_name,
                role
              )
            `)
            .eq('chat_id', chat.id);

          if (participantsError) {
            console.warn('Error fetching participants for chat:', chat.id, participantsError);
            return {
              ...chat,
              participants: []
            };
          }

          // Transform participants data to match ChatSidebar expectations
          const participantsWithProfiles = (participants || []).map((participant: any) => ({
            id: participant.user_id,
            user_id: participant.user_id,
            first_name: participant.profiles?.first_name || '',
            last_name: participant.profiles?.last_name || '',
            email: '', // Removed due to RLS restrictions for non-admin users
            role: participant.profiles?.role || 'staff',
            is_admin: participant.is_admin
          }));

          return {
            ...chat,
            participants: participantsWithProfiles
          };
        })
      );

      setChats(chatsWithData);
      if (chatsWithData.length > 0 && !selectedChat) {
        setSelectedChat(chatsWithData[0]);
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
    if (!chatId) return;
    
    try {
      // Clear existing messages immediately to prevent stale data
      setMessages([]);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('team_messages')
        .select('id, content, created_at, sender_id')
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get unique sender IDs to batch profile fetching
      const uniqueSenderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      // Batch fetch all profiles at once
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role')
        .in('user_id', uniqueSenderIds);

      if (profilesError) {
        console.warn('Error fetching sender profiles:', profilesError);
      }

      // Create profile lookup map
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Transform messages with profile data
      const messagesWithProfiles = messagesData.map(msg => {
        const profile = profileMap.get(msg.sender_id);
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender: {
            id: msg.sender_id,
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: '', // Not available due to RLS restrictions
            role: profile?.role || 'staff'
          }
        };
      });

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]); // Clear messages on error
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
      // Use restricted query - only get basic info for team collaboration
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role, is_active')
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
        .select('first_name, last_name, role')
        .eq('user_id', data.sender_id)
        .maybeSingle();

      const newMsg = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        sender: {
          id: data.sender_id,
          first_name: profile?.first_name || currentProfile?.first_name || 'You',
          last_name: profile?.last_name || currentProfile?.last_name || '',
          email: currentProfile?.email || '', // Use current user's email for their own messages
          role: profile?.role || currentProfile?.role || 'staff'
        }
      };

      setMessages(prev => [...prev, newMsg]);

      // Update chat's last_message_at
      await supabase
        .from('team_chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedChat.id);

      // Notify other participants about the new message
      const participants = selectedChat.participants || [];
      const senderName = `${currentProfile?.first_name || ''} ${currentProfile?.last_name || ''}`.trim() || currentProfile?.email || 'Someone';
      const messagePreview = message.trim().length > 50 ? `${message.trim().substring(0, 50)}...` : message.trim();
      
      for (const participant of participants) {
        if (participant.user_id !== currentUserId) {
          await notifyNewMessage(
            participant.user_id,
            senderName,
            selectedChat.name || 'Chat',
            selectedChat.id,
            messagePreview
          );
        }
      }

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
      
      // Check for existing direct chat to prevent duplicates
      if (!isGroupChat && memberIds.length === 1) {
        const participantIds = [currentUserId, memberIds[0]].sort();
        
        // Find existing direct chat between these two users
        const existingChat = chats.find(chat => {
          if (chat.type !== 'direct') return false;
          
          const chatParticipantIds = chat.participants
            ?.map(p => p.user_id)
            .filter(id => id)
            .sort();
          
          return chatParticipantIds?.length === 2 && 
                 chatParticipantIds[0] === participantIds[0] && 
                 chatParticipantIds[1] === participantIds[1];
        });
        
        if (existingChat) {
          setSelectedChat(existingChat);
          toast({
            title: "Chat already exists",
            description: "Selected existing conversation",
          });
          return;
        }
      }
      
      // For direct chats, get the recipient's name
      let chatName = null;
      if (!isGroupChat) {
        const recipientProfile = profiles.find(p => p.user_id === memberIds[0]);
        if (recipientProfile) {
          const firstName = recipientProfile.first_name || '';
          const lastName = recipientProfile.last_name || '';
          chatName = `${firstName} ${lastName}`.trim();
        }
      } else {
        chatName = groupName || 'New Medical Team Group';
      }
      
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('team_chats')
        .insert({
          type: isGroupChat ? 'group' : 'direct',
          name: chatName,
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

      // Notify participants about the new chat
      const creatorName = `${currentProfile?.first_name || ''} ${currentProfile?.last_name || ''}`.trim() || currentProfile?.email || 'Someone';
      
      for (const memberId of memberIds) {
        await notifyNewChat(
          memberId,
          creatorName,
          chatName || 'New Chat',
          chatData.id
        );
      }

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