import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Send, 
  Plus,
  MessageSquare,
  User
} from "lucide-react";
import { useTeamChats, type TeamChat, type Profile } from "@/hooks/useTeamChats";
import { formatDistanceToNow } from "date-fns";

export const TeamChatSection = () => {
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

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    // For direct chats, search in participant names
    if (chat.type === 'direct') {
      return chat.participants?.some(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // For group chats, search in chat name
    return chat.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleCreateDirectChat = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      await createDirectChat(profile.user_id);
      setIsNewChatOpen(false);
    }
  };

  const getChatDisplayName = (chat: TeamChat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }
    
    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants?.find(p => p.user_id !== chat.created_by);
    return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Direct Chat';
  };

  const getChatAvatar = (chat: TeamChat) => {
    if (chat.type === 'group') {
      return chat.name?.[0]?.toUpperCase() || 'G';
    }
    
    const otherParticipant = chat.participants?.find(p => p.user_id !== chat.created_by);
    return otherParticipant 
      ? `${otherParticipant.first_name?.[0] || ''}${otherParticipant.last_name?.[0] || ''}`.toUpperCase()
      : 'DC';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Chats List */}
      <div className="col-span-4">
        <Card className="border border-border/50 shadow-sm h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Team Chats</span>
              </CardTitle>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Select a team member to start a direct chat:
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {profiles.map(profile => (
                          <div
                            key={profile.id}
                            className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                            onClick={() => handleCreateDirectChat(profile.id)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-sm">
                                {`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {profile.first_name} {profile.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{profile.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search chats..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats found</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/20 ${
                      selectedChat?.id === chat.id ? 'bg-medical-blue/10' : ''
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                          {getChatAvatar(chat)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{getChatDisplayName(chat)}</p>
                          {chat.unread_count > 0 && (
                            <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs">
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {chat.last_message?.content || 'No messages yet'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="col-span-5">
        <Card className="border border-border/50 shadow-sm h-[600px] flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-sm">
                      {getChatAvatar(selectedChat)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{getChatDisplayName(selectedChat)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.type === 'direct' ? 'Direct Message' : `${selectedChat.participants?.length || 0} members`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === selectedChat.created_by ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_id === selectedChat.created_by
                            ? 'bg-medical-blue text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {selectedChat.type === 'group' && message.sender_id !== selectedChat.created_by && (
                          <p className="text-xs font-medium mb-1">
                            {message.sender?.first_name} {message.sender?.last_name}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === selectedChat.created_by ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Chat Info Panel */}
      <div className="col-span-3">
        <Card className="border border-border/50 shadow-sm h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Chat Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedChat ? (
              <>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-lg">
                      {getChatAvatar(selectedChat)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{getChatDisplayName(selectedChat)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.type === 'direct' ? 'Direct Message' : 'Group Chat'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Participants</p>
                    <div className="space-y-2">
                      {selectedChat.participants?.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-muted text-xs">
                              {`${participant.first_name?.[0] || ''}${participant.last_name?.[0] || ''}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {participant.first_name} {participant.last_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(selectedChat.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {selectedChat.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{selectedChat.description}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a chat to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};