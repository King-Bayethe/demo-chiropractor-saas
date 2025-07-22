import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Users, MessageSquare } from "lucide-react";

// Mock data for demonstration
const mockChats = [
  {
    id: "1",
    type: "direct" as const,
    name: null,
    participants: [
      { id: "1", first_name: "John", last_name: "Smith", role: "doctor" },
      { id: "2", first_name: "You", last_name: "", role: "nurse" }
    ],
    last_message: { content: "Patient vitals look good", created_at: new Date().toISOString() },
    unread_count: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    type: "group" as const,
    name: "Medical Team",
    participants: [
      { id: "1", first_name: "John", last_name: "Smith", role: "doctor" },
      { id: "2", first_name: "Mary", last_name: "Johnson", role: "nurse" },
      { id: "3", first_name: "You", last_name: "", role: "admin" }
    ],
    last_message: { content: "Team meeting at 3 PM", created_at: new Date().toISOString() },
    unread_count: 0,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    type: "direct" as const,
    name: null,
    participants: [
      { id: "4", first_name: "Sarah", last_name: "Wilson", role: "nurse" },
      { id: "2", first_name: "You", last_name: "", role: "admin" }
    ],
    last_message: { content: "Shift change notes ready", created_at: new Date().toISOString() },
    unread_count: 0,
    created_at: new Date().toISOString()
  }
];

const mockMessages = [
  {
    id: "1",
    content: "Good morning! How is the patient in room 204 doing?",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    sender: { id: "1", first_name: "John", last_name: "Smith", role: "doctor" }
  },
  {
    id: "2",
    content: "Patient is stable. Vitals are normal and responding well to treatment.",
    created_at: new Date(Date.now() - 3300000).toISOString(),
    sender: { id: "2", first_name: "You", last_name: "", role: "nurse" }
  },
  {
    id: "3",
    content: "Excellent! Please continue monitoring and update me if there are any changes.",
    created_at: new Date(Date.now() - 3000000).toISOString(),
    sender: { id: "1", first_name: "John", last_name: "Smith", role: "doctor" }
  }
];

export const TeamChatSection = () => {
  const [chats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender: { id: "2", first_name: "You", last_name: "", role: "nurse" }
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    }
  };

  const getChatDisplayName = (chat: any): string => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name || 'Medical Team Group';
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== "2"); // Assuming current user id is "2"
    
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                   otherParticipant.role === 'doctor' ? '(Dr.)' : 
                   otherParticipant.role === 'nurse' ? '(RN)' : '';
      return `${firstName} ${lastName} ${role}`.trim() || 'Clinical Consultation';
    }
    return 'Clinical Consultation';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Medical Team Chats</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  {chat.type === 'group' ? (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {chat.participants?.find(p => p.id !== "2")?.first_name?.[0] || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getChatDisplayName(chat)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                  {chat.unread_count ? (
                    <Badge variant="secondary" className="text-xs">
                      {chat.unread_count}
                    </Badge>
                  ) : null}
                </div>
              ))}
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
                      {selectedChat.participants?.find(p => p.id !== "2")?.first_name?.[0] || 'M'}
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
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender.id === "2";
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