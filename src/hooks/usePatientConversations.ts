import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PatientConversation {
  id: string;
  patient_id: string;
  ghl_conversation_id?: string;
  title?: string;
  status: string;
  conversation_type: string;
  last_message_at?: string;
  unread_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PatientMessage {
  id: string;
  conversation_id: string;
  sender_type: 'patient' | 'staff';
  sender_id?: string;
  content: string;
  message_type: string;
  ghl_message_id?: string;
  status: string;
  metadata?: any;
  created_at: string;
}

export function usePatientConversations() {
  const [conversations, setConversations] = useState<PatientConversation[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch conversations with patient data
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_conversations')
        .select(`
          *,
          patient:patients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as PatientMessage[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'staff',
          sender_id: user.id,
          content,
          message_type: 'text',
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add the new message to the current messages
      setMessages(prev => [...prev, data as PatientMessage]);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Create a new conversation
  const createConversation = async (patientId: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('patient_conversations')
        .insert({
          patient_id: patientId,
          title: title || 'New Conversation',
          status: 'active',
          conversation_type: 'sms',
          created_by: user.id
        })
        .select(`
          *,
          patient:patients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;
      
      // Add the new conversation to the list
      setConversations(prev => [data, ...prev]);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    try {
      // Reset unread count for the conversation
      const { error } = await supabase
        .from('patient_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchConversations();

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel('patient_conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patient_conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    // Subscribe to message changes
    const messageChannel = supabase
      .channel('patient_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'patient_messages'
      }, (payload) => {
        const newMessage = payload.new as PatientMessage;
        setMessages(prev => {
          // Only add if it belongs to the currently viewed conversation
          const currentConversationId = prev.length > 0 ? prev[0].conversation_id : null;
          if (newMessage.conversation_id === currentConversationId) {
            return [...prev, newMessage];
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, []);

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead
  };
}