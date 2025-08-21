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
  sender_type: 'patient' | 'provider';
  sender_id?: string;
  content: string;
  message_type: string;
  ghl_message_id?: string;
  status: string;
  sync_status?: string;
  ghl_sent_at?: string;
  ghl_delivered_at?: string;
  ghl_read_at?: string;
  retry_count?: number;
  last_retry_at?: string;
  metadata?: any;
  created_at: string;
}

export function usePatientConversations() {
  const [conversations, setConversations] = useState<PatientConversation[]>([]);
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch conversations with patient data (only for assigned patients)
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_conversations')
        .select(`
          *,
          patient:patients!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            ghl_contact_id,
            patient_providers!inner (
              provider_id,
              is_active
            )
          )
        `)
        .eq('status', 'active')
        .eq('patient.patient_providers.is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message.includes('permission denied') ? 
        'You do not have access to patient conversations. Please contact your administrator.' : 
        err.message
      );
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

  // Send a new message with GHL sync
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get conversation and patient data for GHL sync
      const { data: conversation, error: convError } = await supabase
        .from('patient_conversations')
        .select(`
          id,
          patient_id,
          ghl_conversation_id,
          patients!inner (
            id,
            ghl_contact_id,
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Insert message locally first
      const { data: localMessage, error: messageError } = await supabase
        .from('patient_messages')
        .insert({
          conversation_id: conversationId,
          content,
          sender_type: 'provider',
          sender_id: user.id,
          message_type: 'text',
          status: 'sent',
          sync_status: 'pending',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Add the new message to the current messages immediately
      setMessages(prev => [...prev, localMessage as PatientMessage]);

      // Send to GHL in background if patient has GHL contact ID
      if (conversation.patients.ghl_contact_id) {
        syncMessageToGHL(localMessage.id, conversation.patients.ghl_contact_id, content)
          .catch(err => console.error('GHL sync failed:', err));
      } else {
        // Mark as skipped if no GHL contact
        await supabase
          .from('patient_messages')
          .update({ sync_status: 'skipped' })
          .eq('id', localMessage.id);
        
        // Update local state too
        setMessages(prev => prev.map(msg => 
          msg.id === localMessage.id 
            ? { ...msg, sync_status: 'skipped' }
            : msg
        ));
      }
      
      return localMessage;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sync message to GHL
  const syncMessageToGHL = async (messageId: string, ghlContactId: string, content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-conversations', {
        body: {
          contactId: ghlContactId,
          message: content,
          type: 'SMS'
        }
      });

      if (error) throw error;

      // Only update database if we have permission
      try {
        await supabase
          .from('patient_messages')
          .update({
            sync_status: 'synced',
            ghl_message_id: data?.id,
            ghl_sent_at: new Date().toISOString(),
          })
          .eq('id', messageId);
      } catch (updateError) {
        console.warn('Could not update message in database, but sync succeeded');
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, sync_status: 'synced', ghl_message_id: data?.id, ghl_sent_at: new Date().toISOString() }
          : msg
      ));

      console.log('Message synced to GHL successfully');
    } catch (error) {
      console.error('Failed to sync message to GHL:', error);
      
      // Try to update retry count, but don't fail if we can't
      try {
        const { data: currentMessage } = await supabase
          .from('patient_messages')
          .select('retry_count')
          .eq('id', messageId)
          .single();

        const newRetryCount = (currentMessage?.retry_count || 0) + 1;

        await supabase
          .from('patient_messages')
          .update({
            sync_status: 'failed',
            retry_count: newRetryCount,
            last_retry_at: new Date().toISOString(),
          })
          .eq('id', messageId);
      } catch (updateError) {
        console.warn('Could not update retry count in database');
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, sync_status: 'failed' }
          : msg
      ));
    }
  };

  // Create a new conversation (only for assigned patients)
  const createConversation = async (patientId: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if user has access to this patient via patient_providers
      const { data: providerCheck, error: providerError } = await supabase
        .from('patient_providers')
        .select('id')
        .eq('patient_id', patientId)
        .eq('provider_id', user.id)
        .eq('is_active', true)
        .single();

      if (providerError || !providerCheck) {
        throw new Error('You do not have access to create conversations for this patient');
      }

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

  // Sync conversations from GHL
  const syncGHLConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('ghl-conversation-sync');

      if (error) {
        throw error;
      }

      console.log('GHL sync result:', data);
      
      // Refresh conversations after sync
      await fetchConversations();
      
      return data;
    } catch (err: any) {
      console.error('Failed to sync GHL conversations:', err);
      setError('Failed to sync with GoHighLevel. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    syncGHLConversations
  };
}