import { useState, useEffect, useCallback } from 'react';
import { useGHLApi } from '@/hooks/useGHLApi';
import { usePatients } from '@/hooks/usePatients';

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
}

export const useGHLConversations = () => {
  const [conversations, setConversations] = useState<GHLConversation[]>([]);
  const [messages, setMessages] = useState<GHLMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const ghlApi = useGHLApi();
  const { patients } = usePatients();

  const mapContactToPatient = useCallback((contactId: string) => {
    return patients.find(p => p.ghl_contact_id === contactId);
  }, [patients]);

  const fetchConversations = useCallback(async () => {
    if (!ghlApi) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching GHL conversations...');
      
      const data = await ghlApi.conversations.getAll();
      console.log('Raw GHL conversations:', data);
      
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
      } else {
        setConversations([]);
      }
    } catch (err: any) {
      console.error('Error fetching GHL conversations:', err);
      setError(err.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
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

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!ghlApi) return false;
    
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      console.log('Sending message to GHL:', { conversationId, content });
      
      const messageData = {
        contactId: conversation.contactId,
        message: content,
        type: 'SMS' as const
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

  const createConversation = useCallback(async (patientId: string, title?: string) => {
    // GHL conversations are created automatically when messages are sent
    // For now, we'll just refresh conversations to see if any new ones exist
    await fetchConversations();
    return true;
  }, [fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    // GHL doesn't have a direct mark as read API, so we'll handle this in the UI
    console.log('Marking conversation as read:', conversationId);
    return true;
  }, []);

  const syncGHLConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Auto-fetch conversations when component mounts or patients change
  useEffect(() => {
    if (patients.length > 0) {
      fetchConversations();
    }
  }, [fetchConversations, patients.length]);

  return {
    conversations,
    messages,
    loading,
    messagesLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    syncGHLConversations,
  };
};