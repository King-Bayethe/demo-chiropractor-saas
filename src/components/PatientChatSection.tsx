import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WebAudioApiPlayer } from "@/components/WebAudioApiPlayer";
import { TranscriptionDownload } from "@/components/TranscriptionDownload";
import { 
  Search, 
  Send, 
  Phone, 
  Mail, 
  MessageSquare,
  User,
  Plus,
  Loader2,
  Clock,
  Mic,
  FileAudio,
  RefreshCw
} from "lucide-react";
import { useGHLConversations, GHLConversation, GHLMessage } from "@/hooks/useGHLConversations";
import { usePatients } from "@/hooks/usePatients";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PatientChatSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<GHLConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [audioRecordings, setAudioRecordings] = useState<{[messageId: string]: any}>({});
  const [transcriptions, setTranscriptions] = useState<{[messageId: string]: any}>({});
  
  const {
    conversations,
    messages,
    loading,
    messagesLoading,
    error,
    fetchMessages,
    sendMessage,
    fetchConversations,
    syncGHLConversations
  } = useGHLConversations();
  
  const { patients } = usePatients();

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

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
        const success = await sendMessage(selectedConversation.id, newMessage);
        if (success) {
          setNewMessage("");
          toast.success("Message sent successfully");
        } else {
          toast.error("Failed to send message");
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleSyncGHL = async () => {
    try {
      await syncGHLConversations();
      toast.success("Synced conversations from GoHighLevel");
    } catch (error) {
      console.error('Failed to sync GHL conversations:', error);
      toast.error("Failed to sync with GoHighLevel");
    }
  };

  const getPatientDisplayName = (conversation: GHLConversation) => {
    const patient = conversation.patient;
    if (!patient) return 'Unknown Patient';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient';
  };

  const getPatientAvatar = (conversation: GHLConversation) => {
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

  const fetchAudioRecording = async (messageId: string, recordingId?: string) => {
    if (audioRecordings[messageId]) return audioRecordings[messageId];
    
    console.log('Fetching audio recording for messageId:', messageId, 'recordingId:', recordingId);
    toast.info('Loading audio recording...');
    
    try {
      const { data, error } = await supabase.functions.invoke('ghl-recordings', {
        body: { recordingId: recordingId || messageId }
      });
      
      console.log('Audio recording response:', { data, error });
      
      if (error) throw error;
      
      setAudioRecordings(prev => ({ ...prev, [messageId]: data }));
      toast.success('Audio recording loaded successfully');
      return data;
    } catch (error: any) {
      console.error('Error fetching recording:', error);
      toast.error(`Failed to load audio recording: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  const fetchTranscription = async (messageId: string, recordingId?: string) => {
    if (transcriptions[messageId]) return transcriptions[messageId];
    
    console.log('Fetching transcription for messageId:', messageId, 'recordingId:', recordingId);
    toast.info('Loading transcription...');
    
    try {
      const { data, error } = await supabase.functions.invoke('ghl-transcriptions', {
        body: { 
          recordingId: recordingId,
          messageId: !recordingId ? messageId : undefined 
        }
      });
      
      console.log('Transcription response:', { data, error });
      
      if (error) throw error;
      
      setTranscriptions(prev => ({ ...prev, [messageId]: data }));
      toast.success('Transcription loaded successfully');
      return data;
    } catch (error: any) {
      console.error('Error fetching transcription:', error);
      toast.error(`Failed to load transcription: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  const isAudioMessage = (message: GHLMessage) => {
    return message.type === 'TYPE_CALL' || message.type === 'TYPE_VOICEMAIL';
  };

  const getLastMessage = (conversation: GHLConversation) => {
    return conversation.lastMessage?.body || 'No messages yet';
  };

  const isFromProvider = (message: GHLMessage) => {
    return message.direction === 'outbound';
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
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchConversations} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
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
              <Button size="sm" variant="outline" onClick={handleSyncGHL}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync GHL
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
                    onClick={handleSyncGHL}
                  >
                    Sync from GoHighLevel
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
                          {(conversation.unreadCount || 0) > 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {getLastMessage(conversation)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.lastMessageDate ? formatTime(conversation.lastMessageDate) : 'No date'}
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
                    SMS
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
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
                          className={`flex ${isFromProvider(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              isFromProvider(message)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {/* Message content */}
                            <div className="flex items-start gap-2 mb-2">
                              {isAudioMessage(message) && (
                                <div className="flex items-center gap-1">
                                  {message.type === 'TYPE_CALL' ? (
                                    <Phone className="w-4 h-4" />
                                  ) : (
                                    <Mic className="w-4 h-4" />
                                  )}
                                  <span className="text-xs font-medium">
                                    {message.type === 'TYPE_CALL' ? 'Call' : 'Voicemail'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {message.body && (
                              <p className="text-sm mb-2">{message.body}</p>
                            )}

                            {/* Audio Player for call/voicemail messages */}
                            {isAudioMessage(message) && (
                              <div className="mt-3 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fetchAudioRecording(message.id, message.id)}
                                    className="text-xs"
                                  >
                                    <FileAudio className="w-3 h-3 mr-1" />
                                    Load Audio
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fetchTranscription(message.id, message.id)}
                                    className="text-xs"
                                  >
                                    <FileAudio className="w-3 h-3 mr-1" />
                                    Load Transcript
                                  </Button>
                                </div>

                                {/* Audio Player */}
                                {audioRecordings[message.id] && (
                                  <WebAudioApiPlayer
                                    base64Audio={audioRecordings[message.id].base64Audio}
                                    fileName={audioRecordings[message.id].metadata?.fileName || `${message.type}_${message.id}`}
                                    className="bg-background/50"
                                  />
                                )}

                                {/* Transcription Display and Download */}
                                {transcriptions[message.id] && (
                                  <div className="bg-background/30 p-3 rounded border">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium">Transcription:</span>
                                      <TranscriptionDownload
                                        transcriptionText={transcriptions[message.id].text}
                                        fileName={`transcription_${message.id}`}
                                        contactName={getPatientDisplayName(selectedConversation)}
                                        messageDate={message.dateAdded}
                                        size="sm"
                                        variant="ghost"
                                      />
                                    </div>
                                    {transcriptions[message.id].text ? (
                                      <p className="text-xs leading-relaxed">
                                        {transcriptions[message.id].text}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">
                                        No transcription available
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className={`text-xs ${
                                  isFromProvider(message) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {formatTime(message.dateAdded)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Delivered" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
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
                    <Badge variant="outline">SMS</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                    <Badge variant="default">Active</Badge>
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