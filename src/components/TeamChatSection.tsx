import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, Users, MessageSquare, RefreshCw, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGHLUsers } from "@/hooks/useGHLUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";



export const TeamChatSection = () => {
  const { users: ghlUsers, loading: usersLoading, error: usersError, refetch } = useGHLUsers();
  const { toast } = useToast();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupChatName, setGroupChatName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserEmail(user?.email || null);
      setCurrentUserId(user?.id || null);
    });
  }, []);

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

      // Fetch participants for each chat
      const chatsWithParticipants = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const { data: participants, error: participantsError } = await supabase
            .from('team_chat_participants')
            .select(`
              user_id,
              is_admin,
              profiles(first_name, last_name, email, role)
            `)
            .eq('chat_id', chat.id);

          if (participantsError) throw participantsError;

          return {
            ...chat,
            participants: participants?.map(p => ({
              id: p.user_id,
              first_name: p.profiles?.first_name,
              last_name: p.profiles?.last_name,
              email: p.profiles?.email,
              role: p.profiles?.role,
              is_admin: p.is_admin
            })) || []
          };
        })
      );

      setChats(chatsWithParticipants);
      if (chatsWithParticipants.length > 0 && !selectedChat) {
        setSelectedChat(chatsWithParticipants[0]);
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
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles(first_name, last_name, email, role)
        `)
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const formattedMessages = messagesData?.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender: {
          id: msg.sender_id,
          first_name: msg.profiles?.first_name,
          last_name: msg.profiles?.last_name,
          email: msg.profiles?.email,
          role: msg.profiles?.role
        }
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error", 
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchChats();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id]);

  // Filter out current user from available team members
  const availableUsers = ghlUsers.filter(user => user.email !== currentUserEmail);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat?.id || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          chat_id: selectedChat.id,
          content: newMessage.trim(),
          sender_id: currentUserId
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles(first_name, last_name, email, role)
        `)
        .single();

      if (error) throw error;

      const newMsg = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        sender: {
          id: data.sender_id,
          first_name: data.profiles?.first_name,
          last_name: data.profiles?.last_name,
          email: data.profiles?.email,
          role: data.profiles?.role
        }
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");

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

  const getChatDisplayName = (chat: any): string => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name || 'Medical Team Group';
    
    // For direct chats, find the other participant (not the current user)
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    
    if (otherParticipant) {
      // Handle both GHL API format (firstName/lastName) and mock data format (first_name/last_name)
      const firstName = otherParticipant.firstName || otherParticipant.first_name || '';
      const lastName = otherParticipant.lastName || otherParticipant.last_name || '';
      const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                   otherParticipant.role === 'doctor' ? '(Dr.)' : 
                   otherParticipant.role === 'nurse' ? '(RN)' : '';
      
      const fullName = `${firstName} ${lastName} ${role}`.trim();
      return fullName || otherParticipant.email || 'Team Member';
    }
    return 'Direct Chat';
  };

  const getSenderDisplayName = (sender: any): string => {
    if (!sender) return 'Unknown';
    const firstName = sender.first_name || '';
    const lastName = sender.last_name || '';
    const role = sender.role === 'admin' ? '(Admin)' : 
                 sender.role === 'doctor' ? '(Dr.)' : 
                 sender.role === 'nurse' ? '(RN)' : '';
    return `${firstName} ${lastName} ${role}`.trim() || 'Medical Staff';
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const createNewChat = async () => {
    if (selectedMembers.length === 0 || !currentUserId) return;

    try {
      const isGroupChat = selectedMembers.length > 1;
      
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('team_chats')
        .insert({
          type: isGroupChat ? 'group' : 'direct',
          name: isGroupChat ? (groupChatName || 'New Medical Team Group') : null,
          created_by: currentUserId
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participantInserts = [
        { chat_id: chatData.id, user_id: currentUserId, is_admin: true },
        ...selectedMembers.map(memberId => ({
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
      
      // Reset form
      setSelectedMembers([]);
      setGroupChatName("");
      setIsNewChatOpen(false);

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

  const getMemberDisplayName = (member: any): string => {
    // GHL API returns firstName/lastName, not first_name/last_name
    const firstName = member.firstName || member.first_name || '';
    const lastName = member.lastName || member.last_name || '';
    const role = member.role === 'admin' ? '(Admin)' : 
                 member.role === 'doctor' ? '(Dr.)' : 
                 member.role === 'nurse' ? '(RN)' : '';
    return `${firstName} ${lastName} ${role}`.trim();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)] max-h-[calc(100vh-8rem)]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Medical Team Chats</CardTitle>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Select Team Members
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refetch}
                        disabled={usersLoading}
                      >
                        <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    
                    {usersError && (
                      <div className="text-sm text-destructive mb-2">
                        Error loading users: {usersError}
                      </div>
                    )}
                    
                    <ScrollArea className="h-48 border rounded-md p-3">
                      <div className="space-y-2">
                        {usersLoading ? (
                          <div className="text-center text-muted-foreground py-4">
                            Loading team members...
                          </div>
                        ) : availableUsers.length === 0 ? (
                          <div className="text-center text-muted-foreground py-4">
                            No other team members found
                          </div>
                        ) : (
                          availableUsers.map((member) => (
                            <div key={member.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={member.id}
                                checked={selectedMembers.includes(member.id)}
                                onCheckedChange={() => handleMemberToggle(member.id)}
                              />
                              <div className="flex items-center space-x-2 flex-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {member.first_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <label htmlFor={member.id} className="text-sm cursor-pointer">
                                  {getMemberDisplayName(member)}
                                </label>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {selectedMembers.length > 1 && (
                    <div>
                      <label htmlFor="groupName" className="text-sm font-medium mb-2 block">
                        Group Chat Name (Optional)
                      </label>
                      <Input
                        id="groupName"
                        value={groupChatName}
                        onChange={(e) => setGroupChatName(e.target.value)}
                        placeholder="Enter group name..."
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewChatOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={createNewChat}
                      disabled={selectedMembers.length === 0}
                    >
                      {selectedMembers.length > 1 ? 'Create Group' : 'Start Chat'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)] min-h-[400px]">
            <div className="space-y-2 p-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-4">
                  Loading conversations...
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No conversations yet. Start a new chat!
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                      selectedChat?.id === chat.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div onClick={() => setSelectedChat(chat)} className="flex items-center space-x-3 flex-1 cursor-pointer">
                      {chat.type === 'group' ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {chat.participants?.find(p => p.id !== currentUserId)?.first_name?.[0] || 'M'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{getChatDisplayName(chat)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          No messages yet
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => deleteChat(chat.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center space-x-3">
                {selectedChat.type === 'group' ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  ) : (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {selectedChat.participants?.find(p => p.id !== currentUserId)?.first_name?.[0] || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                <div>
                  <CardTitle className="text-lg">{getChatDisplayName(selectedChat)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.participants?.length} participant{selectedChat.participants?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages Area */}
              <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px] max-h-[500px] p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender.id === currentUserId;
                      return (
                        <div key={message.id} className={`flex items-start space-x-3 ${isOwnMessage ? 'justify-end' : ''}`}>
                          {!isOwnMessage && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {message.sender?.first_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`flex-1 max-w-lg ${isOwnMessage ? 'text-right' : ''}`}>
                            <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                              <span className="text-sm font-medium">
                                {getSenderDisplayName(message.sender)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <div className={`rounded-lg p-3 ${
                              isOwnMessage 
                                ? 'bg-primary text-primary-foreground ml-auto' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                          {isOwnMessage && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-6 flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};