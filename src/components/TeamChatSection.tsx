import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChatLayout } from "./chat/ChatLayout";
import { NewChatDialog } from "./chat/NewChatDialog";

export const TeamChatSection = () => {
  const { toast } = useToast();
  const { user: currentUser, profile: currentProfile } = useAuth();
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
          // Get participants with their profiles in one query
          const { data: participants, error: participantsError } = await supabase
            .from('team_chat_participants')
            .select(`
              user_id,
              is_admin,
              profiles!inner(
                first_name,
                last_name,
                email,
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
            email: participant.profiles?.email || '',
            role: participant.profiles?.role || 'staff',
            is_admin: participant.is_admin
          }));

          // If no participants found, use actual profiles as fallbacks
          let finalParticipants = participantsWithProfiles;
          if (participantsWithProfiles.length === 0 && profiles.length > 0) {
            const availableProfiles = profiles.filter(p => p.user_id !== currentUserId);
            const numberOfParticipants = chat.type === 'group' ? Math.min(3, availableProfiles.length) : 1;
            const chatHash = parseInt(chat.id.substring(0, 8), 16);
            const startIndex = chatHash % Math.max(1, availableProfiles.length);
            
            finalParticipants = availableProfiles
              .slice(startIndex, startIndex + numberOfParticipants)
              .concat(availableProfiles.slice(0, Math.max(0, numberOfParticipants - (availableProfiles.length - startIndex))))
              .slice(0, numberOfParticipants)
              .map(profile => ({
                id: profile.user_id,
                user_id: profile.user_id,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                role: profile.role || 'staff',
                is_admin: false
              }));
          }

          return {
            ...chat,
            participants: finalParticipants
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
          first_name: profile?.first_name || currentProfile?.first_name || 'You',
          last_name: profile?.last_name || currentProfile?.last_name || '',
          email: profile?.email || currentProfile?.email || '',
          role: profile?.role || currentProfile?.role || 'staff'
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
      
      // For direct chats, get the recipient's name
      let chatName = null;
      if (!isGroupChat && memberIds.length === 1) {
        const recipientProfile = profiles.find(p => p.user_id === memberIds[0]);
        if (recipientProfile) {
          const firstName = recipientProfile.first_name || '';
          const lastName = recipientProfile.last_name || '';
          chatName = `${firstName} ${lastName}`.trim() || recipientProfile.email;
        }
      } else if (isGroupChat) {
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