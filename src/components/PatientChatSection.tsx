import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Send, 
  Phone, 
  Mail, 
  MessageSquare,
  User
} from "lucide-react";
import { useGHLApi } from "@/hooks/useGHLApi";
import { useToast } from "@/hooks/use-toast";

interface PatientContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

interface PatientConversation {
  id: string;
  contactId: string;
  lastMessageBody?: string;
  lastMessageDate?: string;
  unreadCount?: number;
  contact?: PatientContact;
}

interface PatientMessage {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  dateAdded: string;
  messageType: string;
}

export const PatientChatSection = () => {
  const [conversations, setConversations] = useState<PatientConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<PatientConversation | null>(null);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<PatientContact[]>([]);
  
  const { conversations: ghlConversations, contacts: ghlContacts } = useGHLApi();
  const { toast } = useToast();

  // Mock data for now since we need to integrate with GHL conversations
  const mockConversations: PatientConversation[] = [
    {
      id: "conv1",
      contactId: "contact1",
      lastMessageBody: "Thank you for the appointment reminder.",
      lastMessageDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
      contact: {
        id: "contact1",
        firstName: "Vito",
        lastName: "Silveiro",
        email: "designerprintingusa@gmail.com",
        phone: "(786) 806-9212",
        tags: ["PIP Patient", "Active"]
      }
    },
    {
      id: "conv2",
      contactId: "contact2",
      lastMessageBody: "¿Puedo reprogramar mi cita?",
      lastMessageDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 2,
      contact: {
        id: "contact2",
        firstName: "Islen",
        lastName: "Martinez",
        phone: "(786) 726-5877",
        tags: ["General Patient"]
      }
    },
    {
      id: "conv3",
      contactId: "contact3",
      lastMessageBody: "I need copies of my treatment records.",
      lastMessageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 1,
      contact: {
        id: "contact3",
        firstName: "Bayethe",
        lastName: "Rowell",
        email: "bayethe.rowell@gmail.com",
        phone: "(330) 722-7379",
        tags: ["PIP Patient", "Follow-up"]
      }
    }
  ];

  const mockMessages: PatientMessage[] = [
    {
      id: "msg1",
      body: "Hi, I need to reschedule my appointment for tomorrow.",
      direction: "inbound",
      dateAdded: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      messageType: "SMS"
    },
    {
      id: "msg2",
      body: "Of course! What time works better for you?",
      direction: "outbound",
      dateAdded: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      messageType: "SMS"
    },
    {
      id: "msg3",
      body: "Would Friday at 2 PM be available?",
      direction: "inbound",
      dateAdded: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      messageType: "SMS"
    },
    {
      id: "msg4",
      body: "Let me check... Yes, Friday at 2 PM is available. I'll reschedule you now.",
      direction: "outbound",
      dateAdded: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      messageType: "SMS"
    },
    {
      id: "msg5",
      body: "Thank you so much!",
      direction: "inbound",
      dateAdded: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      messageType: "SMS"
    }
  ];

  useEffect(() => {
    // Initialize with mock data for now
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
    setMessages(mockMessages);
    setLoading(false);

    // TODO: Implement actual GHL API integration
    // fetchPatientConversations();
  }, []);

  const fetchPatientConversations = async () => {
    try {
      setLoading(true);
      // TODO: Use GHL conversations API
      // const data = await ghlConversations.getAll();
      // setConversations(data);
    } catch (error) {
      console.error('Error fetching patient conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load patient conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const contact = conv.contact;
    if (!contact) return false;
    
    const searchString = `${contact.firstName || ''} ${contact.lastName || ''} ${contact.email || ''} ${contact.phone || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        // TODO: Use GHL conversations API to send message
        // await ghlConversations.sendMessage({
        //   contactId: selectedConversation.contactId,
        //   message: newMessage,
        //   type: 'SMS'
        // });
        
        // For now, just add to local state
        const newMsg: PatientMessage = {
          id: Date.now().toString(),
          body: newMessage,
          direction: "outbound",
          dateAdded: new Date().toISOString(),
          messageType: "SMS"
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        toast({
          title: "Message sent",
          description: "Your message has been sent to the patient",
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    }
  };

  const getContactDisplayName = (contact?: PatientContact) => {
    if (!contact) return 'Unknown Contact';
    return contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown Contact';
  };

  const getContactAvatar = (contact?: PatientContact) => {
    if (!contact) return 'UC';
    const firstName = contact.firstName || contact.name?.split(' ')[0] || '';
    const lastName = contact.lastName || contact.name?.split(' ')[1] || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UC';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
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
      {/* Conversations List */}
      <div className="col-span-4">
        <Card className="border border-border/50 shadow-sm h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Patient Conversations</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/20 ${
                      selectedConversation?.id === conversation.id ? 'bg-medical-blue/10' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium">
                          {getContactAvatar(conversation.contact)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {getContactDisplayName(conversation.contact)}
                          </p>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conversation.lastMessageBody || 'No messages'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.lastMessageDate ? formatTime(conversation.lastMessageDate) : ''}
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
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-sm">
                      {getContactAvatar(selectedConversation.contact)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{getContactDisplayName(selectedConversation.contact)}</p>
                    <p className="text-xs text-muted-foreground">{selectedConversation.contact?.phone}</p>
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
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.direction === 'outbound'
                            ? 'bg-medical-blue text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <p className={`text-xs mt-1 ${
                          message.direction === 'outbound' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.dateAdded)}
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
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Contact Info Panel */}
      <div className="col-span-3">
        <Card className="border border-border/50 shadow-sm h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Patient Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedConversation?.contact ? (
              <>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-medium text-lg">
                      {getContactAvatar(selectedConversation.contact)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{getContactDisplayName(selectedConversation.contact)}</h3>
                </div>

                <Separator />

                <div className="space-y-3">
                  {selectedConversation.contact.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedConversation.contact.phone}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {selectedConversation.contact.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{selectedConversation.contact.email}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {selectedConversation.contact.tags && selectedConversation.contact.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedConversation.contact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Patient
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a conversation to view patient info</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};