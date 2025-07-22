import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search, 
  Send,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";
import { useTeamChats } from "@/hooks/useTeamChats";
import { supabase } from "@/integrations/supabase/client";

export const TeamChatSection = () => {
  // Get current user ID from Supabase auth
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const { 
    chats, 
    selectedChat, 
    setSelectedChat, 
    messages, 
    profiles, 
    loading, 
    createDirectChat, 
    sendMessage 
  } = useTeamChats();

  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages]);

  const getChatDisplayName = (chat: any): string => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name || 'Medical Team Chat';
    
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== currentUserId); 
    
    if (otherParticipant) {
      const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                   otherParticipant.role === 'doctor' ? '(Dr.)' : 
                   otherParticipant.role === 'nurse' ? '(RN)' : '';
      return `${otherParticipant.first_name} ${otherParticipant.last_name} ${role}`.trim();
    }
    return 'Clinical Consultation';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleStartDirectChat = async (participantId: string) => {
    await createDirectChat(participantId);
    setIsNewChatOpen(false);
  };

  const getSenderDisplayName = (sender: any): string => {
    if (!sender) return 'Unknown';
    const role = sender.role === 'admin' ? '(Admin)' : 
                 sender.role === 'doctor' ? '(Dr.)' : 
                 sender.role === 'nurse' ? '(RN)' : '';
    return `${sender.first_name} ${sender.last_name} ${role}`.trim();
  };

  const filteredChats = chats.filter(chat =>
    getChatDisplayName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = profiles.filter(profile => 
    profile.user_id !== currentUserId &&
    !chats.some(chat => 
      chat.type === 'direct' && 
      chat.participants?.some((p: any) => p.user_id === profile.user_id)
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Team Chat
            </h3>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleStartDirectChat(user.user_id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>
                            {user.first_name?.slice(0, 1)}{user.last_name?.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {chat.type === 'group' ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.participants?.[0]?.avatar_url || ""} />
                        <AvatarFallback>
                          {chat.participants?.[0]?.first_name?.slice(0, 1)}
                          {chat.participants?.[0]?.last_name?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {chat.unread_count > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">
                        {getChatDisplayName(chat)}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedChat.type === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.participants?.[0]?.avatar_url || ""} />
                      <AvatarFallback>
                        {selectedChat.participants?.[0]?.first_name?.slice(0, 1)}
                        {selectedChat.participants?.[0]?.last_name?.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h3 className="font-semibold">{getChatDisplayName(selectedChat)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.type === 'group' 
                        ? `${selectedChat.participants?.length || 0} members`
                        : selectedChat.participants?.[0]?.role === 'doctor' ? 'Available for consultation' : 'Online'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url || ""} />
                          <AvatarFallback>
                            {message.sender?.first_name?.slice(0, 1)}
                            {message.sender?.last_name?.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                        {!isOwnMessage && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {getSenderDisplayName(message.sender)}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url || ""} />
                          <AvatarFallback>
                            {message.sender?.first_name?.slice(0, 1)}
                            {message.sender?.last_name?.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamChatSection;