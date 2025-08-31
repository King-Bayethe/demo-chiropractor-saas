import { useState, useEffect, useCallback, useRef } from 'react';
import { useGHLApi } from '@/hooks/useGHLApi';
import { usePatients } from '@/hooks/usePatients';
import { apiRequestManager } from '@/utils/apiRequestManager';

export interface GHLConversation {
  id: string;
  contactId: string;
  locationId?: string;
  lastMessageDate?: string;
  lastMessage?: {
    id: string;
    body?: string;
    type: string;
    direction: string;
    dateAdded: string;
  };
  unreadCount?: number;
  // Patient info mapped from contact
  patient?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
}

export interface GHLMessage {
  id: string;
  conversationId: string;
  type: string;
  direction: string;
  status: string;
  body?: string;
  dateAdded: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name?: string;
  }>;
  meta?: {
    recordingUrl?: string;
    recordingId?: string;
    transcription?: string;
    duration?: number;
  };
  contactId?: string;
  userId?: string;
  hasRecording?: boolean;
  hasTranscription?: boolean;
  recordingData?: {
    id: string;
    url: string;
    duration?: number;
  };
  transcriptionData?: {
    text: string;
    confidence?: number;
  };
  deliveryStatus?: 'sending' | 'delivered' | 'failed' | 'read';
  errorInfo?: string;
}

export const useGHLConversations = () => {
  const [conversations, setConversations] = useState<GHLConversation[]>([]);
  const [messages, setMessages] = useState<GHLMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const mountedRef = useRef(true);
  
  const ghlApi = useGHLApi();
  const { patients } = usePatients();

  const mapContactToPatient = useCallback((contactId: string) => {
    return patients.find(p => p.ghl_contact_id === contactId);
  }, [patients]);

  const fetchConversations = useCallback(async (forceRefresh = false) => {
    if (!ghlApi || !mountedRef.current) return;
    
    const requestKey = 'ghl-conversations-fetch';
    
    try {
      const result = await apiRequestManager.makeRequest(
        requestKey,
        async () => {
          if (!mountedRef.current) throw new Error('Component unmounted');
          
          setLoading(true);
          setError(null);
          console.log('Fetching GHL conversations...');
          
          const data = await ghlApi.conversations.getAll();
          console.log('Raw GHL conversations:', data);
          
          if (!mountedRef.current) return { conversations: [] };
          
          if (data?.conversations) {
            const mappedConversations: GHLConversation[] = data.conversations.map((conv: any) => {
              const patient = mapContactToPatient(conv.contactId);
              return {
                ...conv,
                patient: patient ? {
                  id: patient.id,
                  first_name: patient.first_name,
                  last_name: patient.last_name,
                  email: patient.email,
                  phone: patient.phone,
                } : undefined
              };
            });
            
            console.log('Mapped conversations with patients:', mappedConversations);
            setConversations(mappedConversations);
            return { conversations: mappedConversations };
          } else {
            setConversations([]);
            return { conversations: [] };
          }
        },
        forceRefresh
      );
      
      return result;
    } catch (err: any) {
      if (!mountedRef.current) return;
      console.error('Error fetching GHL conversations:', err);
      if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
        setError('Too many requests. Please wait before refreshing.');
      } else {
        setError(err.message || 'Failed to fetch conversations');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [ghlApi, mapContactToPatient]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!ghlApi) return;
    
    try {
      setMessagesLoading(true);
      console.log('Fetching messages for conversation:', conversationId);
      
      const data = await ghlApi.conversations.getMessages(conversationId);
      console.log('Raw GHL messages:', data);
      
      if (data?.messages) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setMessagesLoading(false);
    }
  }, [ghlApi]);

  const sendMessage = useCallback(async (conversationId: string, content: string, attachments?: File[]) => {
    if (!ghlApi) return false;
    
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      console.log('Sending message to GHL:', { conversationId, content, attachments: attachments?.length });
      
      let attachmentData: Array<{ id: string; url: string; type: string; name?: string }> | undefined;
      
      // Upload attachments if any
      if (attachments && attachments.length > 0) {
        attachmentData = [];
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('conversationId', conversationId);
          
          const uploadResult = await ghlApi.files.upload(formData);
          if (uploadResult?.url) {
            attachmentData.push({
              id: uploadResult.id || file.name,
              url: uploadResult.url,
              type: file.type,
              name: file.name
            });
          }
        }
      }
      
      const messageData = {
        contactId: conversation.contactId,
        message: content,
        type: 'SMS' as const,
        ...(attachmentData && { attachments: attachmentData })
      };
      
      const result = await ghlApi.conversations.sendMessage(messageData);
      console.log('Message sent result:', result);
      
      // Refresh messages after sending
      await fetchMessages(conversationId);
      
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return false;
    }
  }, [ghlApi, conversations, fetchMessages]);

  const uploadFile = useCallback(async (conversationId: string, file: File) => {
    if (!ghlApi) return null;
    
    try {
      console.log('Uploading file to GHL:', { conversationId, fileName: file.name });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      
      const result = await ghlApi.files.upload(formData);
      console.log('File upload result:', result);
      
      return result;
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
      return null;
    }
  }, [ghlApi]);

  const updateMessageStatus = useCallback(async (messageId: string, status: string, errorInfo?: string) => {
    if (!ghlApi) return false;
    
    try {
      console.log('Updating message status:', { messageId, status, errorInfo });
      
      const result = await ghlApi.messages.updateStatus(messageId, { status, errorInfo });
      console.log('Message status update result:', result);
      
      return true;
    } catch (err: any) {
      console.error('Error updating message status:', err);
      setError(err.message || 'Failed to update message status');
      return false;
    }
  }, [ghlApi]);

  const createConversation = useCallback(async (contactId: string, locationId?: string) => {
    if (!ghlApi) return false;
    
    try {
      console.log('Creating new conversation:', { contactId, locationId });
      
      const result = await ghlApi.conversations.create({
        contactId,
        locationId: locationId || 'o7jUs6rjNvBfap2u6VIy' // Default location ID
      });
      
      console.log('Conversation created:', result);
      
      // Refresh conversations after creating
      await fetchConversations();
      
      return true;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation');
      return false;
    }
  }, [ghlApi, fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    // GHL doesn't have a direct mark as read API, so we'll handle this in the UI
    console.log('Marking conversation as read:', conversationId);
    return true;
  }, []);

  const addInboundMessage = useCallback(async (conversationId: string, messageData: any) => {
    if (!ghlApi) return false;
    
    try {
      console.log('Adding inbound message:', { conversationId, ...messageData });
      
      const result = await ghlApi.conversations.addInboundMessage({
        conversationId,
        ...messageData
      });
      
      console.log('Inbound message added:', result);
      
      // Refresh messages after adding
      await fetchMessages(conversationId);
      
      return true;
    } catch (err: any) {
      console.error('Error adding inbound message:', err);
      setError(err.message || 'Failed to add inbound message');
      return false;
    }
  }, [ghlApi, fetchMessages]);

  const addOutboundCall = useCallback(async (conversationId: string, callData: any) => {
    if (!ghlApi) return false;
    
    try {
      console.log('Adding outbound call:', { conversationId, ...callData });
      
      const result = await ghlApi.conversations.addOutboundCall({
        conversationId,
        ...callData
      });
      
      console.log('Outbound call added:', result);
      
      // Refresh messages after adding
      await fetchMessages(conversationId);
      
      return true;
    } catch (err: any) {
      console.error('Error adding outbound call:', err);
      setError(err.message || 'Failed to add outbound call');
      return false;
    }
  }, [ghlApi, fetchMessages]);

  const syncGHLConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Auto-fetch conversations when component mounts
  useEffect(() => {
    mountedRef.current = true;
    
    // Only fetch if we have patients and this is the first load
    if (patients.length > 0 && conversations.length === 0) {
      fetchConversations();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [patients.length]); // Remove fetchConversations from dependencies to prevent loops

  return {
    conversations,
    messages,
    loading,
    messagesLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    uploadFile,
    updateMessageStatus,
    createConversation,
    addInboundMessage,
    addOutboundCall,
    markAsRead,
    syncGHLConversations,
  };
};