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
  User,
  Plus,
  Loader2,
  Clock
} from "lucide-react";
import { usePatientConversations, PatientConversation, PatientMessage } from "@/hooks/usePatientConversations";
import { usePatients } from "@/hooks/usePatients";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';

export const PatientChatSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<PatientConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    conversations,
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead
  } = usePatientConversations();
  
  const { patients } = usePatients();

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages, markAsRead]);

  // Auto-select the first conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const patient = conv.patient;
    if (!patient) return false;
    
    const searchString = `${patient.first_name || ''} ${patient.last_name || ''} ${patient.email || ''} ${patient.phone || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        await sendMessage(selectedConversation.id, newMessage);
        setNewMessage("");
        
        toast.success("Message sent successfully");
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleCreateConversation = async () => {
    // For demo, create a conversation with the first patient
    if (patients.length > 0) {
      try {
        const newConversation = await createConversation(patients[0].id);
        setSelectedConversation(newConversation);
        toast.success("New conversation created");
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error("Failed to create conversation");
      }
    } else {
      toast.error("No patients available to start a conversation with");
    }
  };

  const getPatientDisplayName = (conversation: PatientConversation) => {
    const patient = conversation.patient;
    if (!patient) return 'Unknown Patient';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient';
  };

  const getPatientAvatar = (conversation: PatientConversation) => {
    const patient = conversation.patient;
    if (!patient) return 'UP';
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'UP';
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

  const getLastMessage = (conversation: PatientConversation) => {
    return conversation.title || 'No messages yet';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading conversations</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Conversations List */}
      <div className="col-span-4">
        <Card className="border border-border/50 shadow-sm h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Patient Conversations</span>
              </CardTitle>
              <Button size="sm" onClick={handleCreateConversation}>
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleCreateConversation}
                  >
                    Start a conversation
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getPatientAvatar(conversation)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {getPatientDisplayName(conversation)}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {getLastMessage(conversation)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.last_message_at ? formatTime(conversation.last_message_at) : formatTime(conversation.created_at)}
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
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {getPatientAvatar(selectedConversation)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{getPatientDisplayName(selectedConversation)}</p>
                    <p className="text-xs text-muted-foreground">{selectedConversation.patient?.phone}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {selectedConversation.conversation_type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'provider' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender_type === 'provider'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs ${
                                message.sender_type === 'provider' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            {/* GHL Sync Status for Provider Messages */}
                            {message.sender_type === 'provider' && (
                              <div className="flex items-center space-x-1">
                                {message.sync_status === 'pending' && (
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Syncing to GHL..." />
                                )}
                                {message.sync_status === 'synced' && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Synced to GHL" />
                                )}
                                {message.sync_status === 'failed' && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full" title="GHL sync failed" />
                                )}
                                {message.sync_status === 'skipped' && (
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" title="GHL sync skipped" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
            {selectedConversation?.patient ? (
              <>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {getPatientAvatar(selectedConversation)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{getPatientDisplayName(selectedConversation)}</h3>
                  {selectedConversation.patient.email && (
                    <p className="text-sm text-muted-foreground">{selectedConversation.patient.email}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {selectedConversation.patient.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedConversation.patient.phone}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {selectedConversation.patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{selectedConversation.patient.email}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Conversation Type</p>
                    <Badge variant="outline">{selectedConversation.conversation_type.toUpperCase()}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                    <Badge variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}>
                      {selectedConversation.status}
                    </Badge>
                  </div>
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
                <p className="text-sm">Select a conversation to view patient details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};