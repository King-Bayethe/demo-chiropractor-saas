import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface GHLConversation {
  id: string;
  contactId: string;
  lastMessageDate: string;
  lastMessageBody: string;
  lastMessageDirection: string;
  unreadCount: number;
  type: string;
}

interface GHLMessage {
  id: string;
  conversationId: string;
  type: string;
  body: string;
  direction: string;
  status: string;
  dateAdded: string;
  contactId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting GHL conversation sync...');

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    // First, get all conversations from GHL
    const conversationsResponse = await fetch(`${GHL_API_BASE}/conversations/`, {
      method: 'GET',
      headers,
    });

    if (!conversationsResponse.ok) {
      throw new Error(`GHL API error: ${conversationsResponse.status}`);
    }

    const conversationsData = await conversationsResponse.json();
    const conversations: GHLConversation[] = conversationsData.conversations || [];

    console.log(`Found ${conversations.length} conversations in GHL`);

    let syncedCount = 0;
    let messagesImported = 0;

    for (const ghlConversation of conversations) {
      try {
        // Find the patient with this GHL contact ID
        const { data: patients, error: patientError } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .eq('ghl_contact_id', ghlConversation.contactId)
          .limit(1);

        if (patientError) {
          console.error('Error finding patient:', patientError);
          continue;
        }

        if (!patients || patients.length === 0) {
          console.log(`No patient found for GHL contact ID: ${ghlConversation.contactId}`);
          continue;
        }

        const patient = patients[0];

        // Check if conversation already exists
        const { data: existingConversations, error: convError } = await supabase
          .from('patient_conversations')
          .select('id')
          .eq('ghl_conversation_id', ghlConversation.id)
          .limit(1);

        if (convError) {
          console.error('Error checking existing conversation:', convError);
          continue;
        }

        let conversationId: string;

        if (existingConversations && existingConversations.length > 0) {
          // Update existing conversation
          conversationId = existingConversations[0].id;
          
          const { error: updateError } = await supabase
            .from('patient_conversations')
            .update({
              status: 'active',
              conversation_type: ghlConversation.type || 'sms',
              unread_count: ghlConversation.unreadCount || 0,
              last_message_at: ghlConversation.lastMessageDate,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

          if (updateError) {
            console.error('Error updating conversation:', updateError);
            continue;
          }
        } else {
          // Create new conversation
          const { data: newConversation, error: createError } = await supabase
            .from('patient_conversations')
            .insert({
              patient_id: patient.id,
              ghl_conversation_id: ghlConversation.id,
              title: `Conversation with ${patient.first_name} ${patient.last_name}`.trim(),
              status: 'active',
              conversation_type: ghlConversation.type || 'sms',
              unread_count: ghlConversation.unreadCount || 0,
              last_message_at: ghlConversation.lastMessageDate,
            })
            .select('id')
            .single();

          if (createError || !newConversation) {
            console.error('Error creating conversation:', createError);
            continue;
          }

          conversationId = newConversation.id;
        }

        // Now fetch and import messages for this conversation
        const messagesResponse = await fetch(`${GHL_API_BASE}/conversations/${ghlConversation.id}/messages`, {
          method: 'GET',
          headers,
        });

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          const messages: GHLMessage[] = messagesData.messages || [];

          for (const ghlMessage of messages) {
            // Check if message already exists
            const { data: existingMessages, error: msgCheckError } = await supabase
              .from('patient_messages')
              .select('id')
              .eq('ghl_message_id', ghlMessage.id)
              .limit(1);

            if (msgCheckError) {
              console.error('Error checking existing message:', msgCheckError);
              continue;
            }

            if (existingMessages && existingMessages.length > 0) {
              continue; // Message already exists
            }

            // Import the message
            const { error: msgInsertError } = await supabase
              .from('patient_messages')
              .insert({
                conversation_id: conversationId,
                ghl_message_id: ghlMessage.id,
                content: ghlMessage.body || '',
                message_type: ghlMessage.type || 'text',
                sender_type: ghlMessage.direction === 'inbound' ? 'patient' : 'provider',
                status: ghlMessage.status || 'sent',
                sync_status: 'synced',
                created_at: ghlMessage.dateAdded,
                metadata: {
                  ghl_conversation_id: ghlMessage.conversationId,
                  ghl_contact_id: ghlMessage.contactId,
                  direction: ghlMessage.direction,
                },
              });

            if (msgInsertError) {
              console.error('Error inserting message:', msgInsertError);
            } else {
              messagesImported++;
            }
          }
        }

        syncedCount++;
      } catch (error) {
        console.error(`Error processing conversation ${ghlConversation.id}:`, error);
      }
    }

    console.log(`Sync complete: ${syncedCount} conversations, ${messagesImported} messages imported`);

    return new Response(JSON.stringify({ 
      success: true,
      conversationsSynced: syncedCount,
      messagesImported: messagesImported,
      message: `Successfully synced ${syncedCount} conversations and imported ${messagesImported} messages`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in ghl-conversation-sync function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);