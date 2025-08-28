import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGoHighLevel } from "@/hooks/useGoHighLevel";

// --- UI Component Imports ---
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  Users,
  Loader2,
  Volume2,
  Plus
} from "lucide-react";

// --- UI Components ---
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { WebAudioApiPlayer } from "@/components/WebAudioApiPlayer";
import { TranscriptionDownload } from "@/components/TranscriptionDownload";
import { AudioDownloadButton } from "@/components/AudioDownloadButton";
import { FileAttachment } from "@/components/conversations/FileAttachment";
import { MessageStatusIndicator } from "@/components/conversations/MessageStatusIndicator";
import { FileUploadButton } from "@/components/conversations/FileUploadButton";
import { CreateConversationDialog } from "@/components/conversations/CreateConversationDialog";
import { AddMessageDialog } from "@/components/conversations/AddMessageDialog";


// --- Main Conversations Component ---
export default function Conversations() {
  const { toast } = useToast();
  const { getMessageRecording, getMessageTranscription } = useGoHighLevel();
  
  // State management for data, loading, and errors
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [recordingUrls, setRecordingUrls] = useState(new Map());
  const [transcriptions, setTranscriptions] = useState(new Map());

  // Loading states for different parts of the UI
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-pending';
      case 'completed': return 'status-approved';
      case 'pending': return 'status-draft';
      default: return 'status-draft';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'website': case 'facebook': case 'chat': return 'bg-blue-100 text-blue-700';
      case 'google': case 'email': return 'bg-green-100 text-green-700';
      case 'referral': case 'sms': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0,3)}) ${number.slice(3,6)}-${number.slice(6)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const createCustomerName = (conv) => {
    const contact = conv.contact || {};
    
    // First try actual names
    const fullName = contact.fullName || contact.name || conv.fullName;
    if (fullName && fullName.trim()) return fullName.trim();
    
    const firstName = contact.firstName || conv.firstName;
    const lastName = contact.lastName || conv.lastName;
    if (firstName && lastName) return `${firstName.trim()} ${lastName.trim()}`;
    if (firstName && firstName.trim()) return firstName.trim();
    
    // Use contactName if available (GoHighLevel already formats phone numbers here)
    if (conv.contactName && conv.contactName.trim()) {
      return conv.contactName.trim();
    }
    
    // Try to get phone number from conversation data
    let phone = conv.phone || contact.phone;
    if (!phone && conv.contactData?.phone) {
      phone = conv.contactData.phone;
    }
    
    // Use phone number when no name is available
    if (phone && phone.trim()) return formatPhoneNumber(phone);
    
    // Last resort fallback
    return 'No Contact Info';
  };

  const getAvatarInitials = (conv) => {
    const contact = conv.contact || {};
    const fullName = contact.fullName || contact.name;
    if (fullName && fullName.trim()) {
      return fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    const firstName = contact.firstName;
    const lastName = contact.lastName;
    if (firstName && lastName) {
      return `${firstName.trim()[0]}${lastName.trim()[0]}`.toUpperCase();
    }
    if (firstName && firstName.trim()) {
      return firstName.trim()[0].toUpperCase();
    }
    
    // No real name available, use "NN"
    return "NN";
  };

  const transformConversationData = (ghlData) => {
    if (!Array.isArray(ghlData)) return [];
    return ghlData.map((conv) => {
      const customerName = createCustomerName(conv);
      const contact = conv.contact || {};
      
      // Get phone from multiple possible sources
      let rawPhone = conv.phone || contact.phone;
      if (!rawPhone && conv.contactData?.phone) {
        rawPhone = conv.contactData.phone;
      }
      
      const formattedPhone = formatPhoneNumber(rawPhone || '');
      const customerEmail = contact.email || '';
      const lastMessageTime = conv.lastMessageDate ? new Date(parseInt(conv.lastMessageDate)).toLocaleString() : 'No time';
      const locationInfo = contact.city && contact.state ? `${contact.city}, ${contact.state}` : '';
      
      return {
        id: conv.id,
        contactId: conv.contactId,
        customerName,
        customerEmail,
        customerPhone: formattedPhone,
        rawPhone: rawPhone || '',
        locationInfo,
        lastMessage: conv.lastMessageBody || 'No messages yet',
        lastMessageTime,
        status: conv.lastMessageDirection === 'inbound' ? 'active' : 'pending',
        unreadCount: conv.unreadCount || 0,
        avatar: '',
        source: conv.lastMessageType?.toLowerCase()?.replace('type_', '') || 'phone'
      };
    });
  };
  
  // Fetch conversations from Supabase Edge Function
  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setError(null);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('ghl-conversations', {
        body: { method: 'GET' }
      });
      if (funcError) throw funcError;

      if (data?.conversations) {
        const transformed = transformConversationData(data.conversations);
        setConversations(transformed);
        if (!selectedConversation && transformed.length > 0) {
          setSelectedConversation(transformed[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (err) {
      setError(err.message);
      toast({ title: "Error Loading Conversations", description: err.message, variant: "destructive" });
    } finally {
      setConversationsLoading(false);
    }
  }, [toast, selectedConversation]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Fetch messages for the selected conversation using the new dedicated function
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation?.id) {
        setMessages([]);
        return;
      }
      
      setMessagesLoading(true);
      try {
        // UPDATED: Call the new 'ghl-messages-edge-function'
        const { data, error: funcError } = await supabase.functions.invoke('ghl-messages', {
          body: { conversationId: selectedConversation.id }
        });
        if (funcError) throw funcError;

        // Handle the messages array returned by ghl-messages function
        const messagesArray = data?.messages || [];
        if (Array.isArray(messagesArray) && messagesArray.length > 0) {
          const transformed = messagesArray.map((msg) => ({
            id: msg.id,
            sender: msg.direction === 'outbound' ? 'agent' : 'customer',
            content: msg.body || '',
            timestamp: new Date(msg.dateAdded).toISOString(),
            read: true,
            type: msg.messageType || 'TYPE_SMS',
            messageType: msg.messageType,
            duration: msg.meta?.call?.duration,
            hasRecording: msg.messageType === 'TYPE_CALL' || msg.messageType === 'TYPE_VOICEMAIL',
            hasTranscription: msg.messageType === 'TYPE_CALL' || msg.messageType === 'TYPE_VOICEMAIL'
          })).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setMessages(transformed);
          
          // Check for recordings and transcriptions for call/voicemail messages
          const callMessages = transformed.filter(msg => msg.hasRecording || msg.hasTranscription);
          if (callMessages.length > 0) {
            loadRecordings(callMessages);
            loadTranscriptions(callMessages);
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        toast({ title: "Error Loading Messages", description: err.message, variant: "destructive" });
      } finally {
        setMessagesLoading(false);
      }
    };
    loadMessages();
  }, [selectedConversation, toast]);

  // Load recordings for call/voicemail messages
  const loadRecordings = useCallback(async (callMessages) => {
    const newRecordingUrls = new Map();
    
    for (const message of callMessages) {
      try {
        const data = await getMessageRecording(message.id);
        console.log(`🔍 Raw recording API response for ${message.id}:`, JSON.stringify(data, null, 2));
        console.log(`🔍 Type of data:`, typeof data);
        console.log(`🔍 Type of data.recording:`, typeof data?.recording);
        console.log(`🔍 Type of data.recording.url:`, typeof data?.recording?.url);
        
        if (data?.recording?.url) {
          let url = data.recording.url;
          console.log(`🔍 Original URL for ${message.id}:`, url);
          console.log(`🔍 URL type:`, typeof url);
          console.log(`🔍 URL constructor:`, url.constructor?.name);
          
          // Unwrap URL if it's wrapped in an object with _type and value properties
          if (typeof url === 'object' && url._type === 'String' && url.value) {
            console.log(`🔧 Unwrapping URL for ${message.id}:`, url);
            url = url.value;
          }
          
          // Additional unwrapping for other possible wrapper formats
          if (typeof url === 'object' && typeof url.toString === 'function' && url.toString() !== '[object Object]') {
            console.log(`🔧 Converting object to string for ${message.id}:`, url.toString());
            url = url.toString();
          }
          
          console.log(`🔍 Final URL for ${message.id}:`, typeof url, url?.substring?.(0, 50) + '...');
          
          // Validate that we have a proper string URL
          if (typeof url === 'string' && (url.startsWith('data:') || url.startsWith('http'))) {
            newRecordingUrls.set(message.id, url);
            console.log(`✅ Stored recording URL for ${message.id}:`, url.substring(0, 50) + '...');
          } else {
            console.error(`❌ Invalid URL format for ${message.id}:`, typeof url, url);
          }
        } else {
          console.log(`⚠️ No recording URL found for ${message.id}`);
        }
      } catch (error) {
        console.log(`❌ No recording available for message ${message.id}:`, error);
      }
    }
    
    console.log(`🔍 Final newRecordingUrls Map:`, Array.from(newRecordingUrls.entries()));
    
    setRecordingUrls(prev => {
      const updated = new Map(prev);
      newRecordingUrls.forEach((url, id) => updated.set(id, url));
      console.log(`🔍 Updated recordingUrls Map:`, Array.from(updated.entries()));
      return updated;
    });
  }, [getMessageRecording]);

  // Load transcriptions for call/voicemail messages
  const loadTranscriptions = useCallback(async (callMessages) => {
    const newTranscriptions = new Map();
    
    for (const message of callMessages) {
      try {
        const data = await getMessageTranscription(message.id);
        if (data?.transcription?.text) {
          newTranscriptions.set(message.id, data.transcription.text);
        }
      } catch (error) {
        console.log(`No transcription available for message ${message.id}`);
      }
    }
    
    setTranscriptions(prev => {
      const updated = new Map(prev);
      newTranscriptions.forEach((text, id) => updated.set(id, text));
      return updated;
    });
  }, [getMessageTranscription]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation) return;

    setIsSending(true);
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: 'agent',
      content: newMessage,
      timestamp: new Date().toISOString(),
      attachments: selectedFiles.map(file => ({
        id: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name
      })),
      deliveryStatus: 'sending' as const
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    const filesToSend = [...selectedFiles];
    setNewMessage("");
    setSelectedFiles([]);

    try {
      let attachmentData;
      
      // Upload files first if any
      if (filesToSend.length > 0) {
        attachmentData = [];
        for (const file of filesToSend) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('conversationId', selectedConversation.id);
          
          const { data: uploadData, error: uploadError } = await supabase.functions.invoke('ghl-file-upload', {
            body: formData
          });
          
          if (uploadError) throw uploadError;
          
          if (uploadData?.url) {
            attachmentData.push({
              id: uploadData.id || file.name,
              url: uploadData.url,
              type: file.type,
              name: file.name
            });
          }
        }
      }

      const { data, error: funcError } = await supabase.functions.invoke('ghl-conversations', {
        body: {
          method: 'POST',
          contactId: selectedConversation.contactId,
          message: messageToSend,
          type: 'SMS',
          ...(attachmentData && { attachments: attachmentData })
        }
      });

      if (funcError) throw funcError;
      
      toast({ title: "Message Sent!", description: "Your message has been sent successfully", variant: "default" });
      
      // Update message status to delivered
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, deliveryStatus: 'delivered' as const }
          : msg
      ));
      
      // Refresh messages
      const { data: messagesData } = await supabase.functions.invoke('ghl-messages', {
          body: { conversationId: selectedConversation.id }
      });
      const messagesArray = messagesData?.messages || [];
      if (Array.isArray(messagesArray)) {
          const transformed = messagesArray.map((msg) => ({
            id: msg.id, sender: msg.direction === 'outbound' ? 'agent' : 'customer',
            content: msg.body || '', timestamp: new Date(msg.dateAdded).toISOString(), read: true,
            type: msg.messageType || 'TYPE_SMS',
            messageType: msg.messageType,
            duration: msg.meta?.call?.duration,
            hasRecording: msg.messageType === 'TYPE_CALL' || msg.messageType === 'TYPE_VOICEMAIL',
            hasTranscription: msg.messageType === 'TYPE_CALL' || msg.messageType === 'TYPE_VOICEMAIL',
            attachments: msg.attachments || [],
            deliveryStatus: msg.status || 'delivered'
          })).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setMessages(transformed);
      }

      loadConversations();

    } catch (err) {
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, deliveryStatus: 'failed' as const, errorInfo: err.message }
          : msg
      ));
      
      let errorMessage = err.message;
      if (err.message.includes("Cannot send message as DND is active") || err.message.includes("DND is active")) {
        errorMessage = "Cannot send message to a patient that has dnd on";
      }
      
      toast({ title: "Failed to Send Message", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !selectedConversation) return;

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, deliveryStatus: 'sending' as const }
        : msg
    ));

    try {
      const { data, error: funcError } = await supabase.functions.invoke('ghl-conversations', {
        body: {
          method: 'POST',
          contactId: selectedConversation.contactId,
          message: message.content,
          type: 'SMS',
          ...(message.attachments && { attachments: message.attachments })
        }
      });

      if (funcError) throw funcError;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deliveryStatus: 'delivered' as const }
          : msg
      ));
      
      toast({ title: "Message Sent!", description: "Your message has been resent successfully", variant: "default" });
      
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deliveryStatus: 'failed' as const, errorInfo: err.message }
          : msg
      ));
      
      toast({ title: "Failed to Resend Message", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <style>{`
          .card-professional { transition: all 0.2s ease-in-out; }
          .card-professional:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-approved { background-color: #d1fae5; color: #065f46; }
          .status-draft { background-color: #e5e7eb; color: #374151; }
        `}</style>
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Conversations</h1>
              <p className="text-muted-foreground">Manage patient communications and inquiries</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
              <Button><MessageSquare className="mr-2 h-4 w-4" /> New Message</Button>
            </div>
          </div>

          <Tabs defaultValue="inbox" className="space-y-6">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
                <div className="lg:col-span-1 xl:col-span-1">
                  <Card className="card-professional h-[700px] flex flex-col">
                    <CardHeader>
                       <div className="flex items-center justify-between">
                         <CardTitle>All Conversations</CardTitle>
                         <div className="flex items-center gap-2">
                           <CreateConversationDialog />
                           <Badge variant="secondary">{conversations.length}</Badge>
                         </div>
                       </div>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search conversations..." className="pl-10" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center p-8 h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                      ) : conversations.length === 0 ? (
                        <div className="text-center py-8 px-4"><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No conversations found</p></div>
                      ) : (
                        <div className="space-y-1">
                          {conversations.map((conv) => (
                            <div key={conv.id} className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`} onClick={() => setSelectedConversation(conv)}>
                              <div className="flex items-start gap-3">
                                <Avatar><AvatarFallback>{getAvatarInitials(conv)}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium truncate">{conv.customerName}</h4>
                                    {conv.unreadCount > 0 && <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">{conv.unreadCount}</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">{new Date(conv.lastMessageTime).toLocaleTimeString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                                    <Badge className={`text-xs capitalize ${getSourceColor(conv.source)}`}>{conv.source}</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 xl:col-span-3">
                  <Card className="card-professional h-[700px] flex flex-col">
                    <CardHeader className="border-b border-border">
                      {selectedConversation ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar><AvatarFallback>{getAvatarInitials(selectedConversation)}</AvatarFallback></Avatar>
                            <div>
                              <h3 className="font-semibold">{selectedConversation.customerName}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {selectedConversation.customerPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedConversation.customerPhone}</span>}
                                {selectedConversation.customerEmail && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedConversation.customerEmail}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AddMessageDialog conversationId={selectedConversation.id} />
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ) : <div className="h-[57px]"></div>}
                    </CardHeader>

                    <CardContent className="flex-1 p-4 overflow-y-auto bg-muted/30">
                      {!selectedConversation ? (
                         <div className="flex-1 flex items-center justify-center text-muted-foreground h-full"><div className="text-center"><MessageSquare className="h-8 w-8 mx-auto mb-2" /><p>Select a conversation to view messages</p></div></div>
                      ) : messagesLoading ? (
                        <div className="flex items-center justify-center p-8 h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center p-8 h-full"><div className="text-center text-muted-foreground"><MessageSquare className="h-8 w-8 mx-auto mb-2" /><p>No messages yet. Be the first to reply!</p></div></div>
                      ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                              <div key={message.id} className={`flex items-start gap-2 ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                 {message.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarFallback>{getAvatarInitials(selectedConversation)}</AvatarFallback></Avatar>}
                                <div className={`space-y-2 max-w-xs lg:max-w-md ${message.sender === 'agent' ? 'items-end' : 'items-start'} flex flex-col`}>
                                   <div className={`px-4 py-2 rounded-2xl ${message.sender === 'agent' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border text-foreground rounded-bl-none'}`}>
                                     {message.hasRecording && (
                                       <div className="mb-2 flex items-center gap-2 text-xs opacity-75">
                                         <Volume2 className="h-3 w-3" />
                                         <span>
                                           {message.messageType === 'TYPE_CALL' ? 'Call Recording' : 'Voicemail'}
                                           {message.duration && ` (${Math.floor(message.duration / 60)}:${String(message.duration % 60).padStart(2, '0')})`}
                                         </span>
                                       </div>
                                     )}
                                     
                                     {message.content && (
                                       <p className="text-sm" style={{ opacity: message.id.startsWith('temp_') ? 0.7 : 1 }}>
                                         {message.content}
                                       </p>
                                     )}
                                     
                                     {message.attachments && message.attachments.length > 0 && (
                                       <div className="mt-2 space-y-2">
                                         {message.attachments.map((attachment, index) => (
                                           <FileAttachment
                                             key={`${attachment.id}-${index}`}
                                             attachment={attachment}
                                             size="md"
                                           />
                                         ))}
                                       </div>
                                     )}
                                     
                                      {message.hasTranscription && transcriptions.has(message.id) && (
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                          <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs opacity-75">Transcription:</p>
                                            <TranscriptionDownload 
                                              transcriptionText={transcriptions.get(message.id)}
                                              fileName={`transcription_${message.id}`}
                                            />
                                          </div>
                                          <p className="text-sm">{transcriptions.get(message.id)}</p>
                                        </div>
                                      )}
                                   </div>
                                   
                                  {message.hasRecording && recordingUrls.has(message.id) && (
                                   <>
                                      <WebAudioApiPlayer 
                                        audioUrl={(() => {
                                          const url = recordingUrls.get(message.id);
                                          console.log(`🎵 Passing to WebAudioApiPlayer for ${message.id}:`, typeof url, url);
                                          return url;
                                        })()} 
                                        fileName={`recording_${message.id}`}
                                        className={message.sender === 'agent' ? 'self-end' : 'self-start'}
                                      />
                                     <AudioDownloadButton
                                       audioUrl={recordingUrls.get(message.id)}
                                       fileName={`recording_${message.id}`}
                                       variant="outline"
                                       size="sm"
                                       className={`mt-2 ${message.sender === 'agent' ? 'self-end' : 'self-start'}`}
                                     />
                                   </>
                                    )}
                                    
                                 <div className={`flex items-center gap-2 text-xs mt-1 ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                   <span className={message.sender === 'agent' ? 'text-primary/70' : 'text-muted-foreground'}>
                                     {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                   {message.sender === 'agent' && message.deliveryStatus && (
                                     <MessageStatusIndicator
                                       status={message.deliveryStatus}
                                       errorInfo={message.errorInfo}
                                       onRetry={message.deliveryStatus === 'failed' ? () => handleRetryMessage(message.id) : undefined}
                                     />
                                   )}
                                 </div>
                               </div>
                             </div>
                           ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </CardContent>

                    <form onSubmit={handleSendMessage} className="border-t border-border bg-card">
                      {selectedFiles.length > 0 && (
                        <div className="p-4 border-b border-border">
                          <FileUploadButton
                            onFilesSelected={setSelectedFiles}
                            selectedFiles={selectedFiles}
                            onRemoveFile={(index) => {
                              setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            disabled={isSending}
                          />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 relative">
                            <Input 
                              placeholder="Type your message..." 
                              className="pr-10" 
                              value={newMessage} 
                              onChange={(e) => setNewMessage(e.target.value)} 
                              disabled={!selectedConversation || isSending} 
                            />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0">
                              <Smile className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </div>
                          
                           <FileUploadButton
                             onFilesSelected={(files) => setSelectedFiles(prev => [...prev, ...files])}
                             selectedFiles={[]}
                             onRemoveFile={() => {}}
                             disabled={!selectedConversation || isSending}
                           />
                           
                          <Button 
                            type="submit" 
                            disabled={!selectedConversation || (!newMessage.trim() && selectedFiles.length === 0) || isSending}
                          >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
             <TabsContent value="active"><div className="text-center p-8 text-muted-foreground">Active conversations would be listed here.</div></TabsContent>
             <TabsContent value="completed"><div className="text-center p-8 text-muted-foreground">Completed conversations would be listed here.</div></TabsContent>
             <TabsContent value="archive"><div className="text-center p-8 text-muted-foreground">Archived conversations would be listed here.</div></TabsContent>

          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
}