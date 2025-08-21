import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface GHLWebhookMessage {
  type: string;
  locationId: string;
  contactId: string;
  conversationId: string;
  messageId: string;
  message: {
    body: string;
    direction: 'inbound' | 'outbound';
    type: 'SMS' | 'Email';
    dateAdded: string;
    attachments?: Array<{
      url: string;
      type: string;
    }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GHL Webhook received:', req.method);

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const webhookData: GHLWebhookMessage = await req.json();
    console.log('Webhook payload:', JSON.stringify(webhookData, null, 2));

    // Only process inbound messages
    if (webhookData.message?.direction !== 'inbound') {
      console.log('Skipping outbound message');
      return new Response(JSON.stringify({ status: 'skipped', reason: 'outbound message' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Find patient by GHL contact ID
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, email, phone')
      .eq('ghl_contact_id', webhookData.contactId)
      .eq('is_active', true)
      .single();

    if (patientError) {
      console.error('Patient lookup error:', patientError);
      // Could implement auto-creation of patient records here
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Patient not found for contact ID: ' + webhookData.contactId 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Found patient:', patient);

    // Find or create conversation
    let conversationId: string;
    const { data: existingConversation } = await supabase
      .from('patient_conversations')
      .select('id')
      .eq('ghl_conversation_id', webhookData.conversationId)
      .eq('patient_id', patient.id)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
      console.log('Using existing conversation:', conversationId);
    } else {
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('patient_conversations')
        .insert({
          patient_id: patient.id,
          ghl_conversation_id: webhookData.conversationId,
          title: `${webhookData.message.type} with ${patient.first_name} ${patient.last_name}`,
          conversation_type: webhookData.message.type.toLowerCase(),
          status: 'active',
          last_message_at: new Date(webhookData.message.dateAdded).toISOString(),
        })
        .select('id')
        .single();

      if (conversationError) {
        console.error('Conversation creation error:', conversationError);
        return new Response(JSON.stringify({ 
          status: 'error', 
          message: 'Failed to create conversation' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      conversationId = newConversation.id;
      console.log('Created new conversation:', conversationId);
    }

    // Create message record
    const { data: message, error: messageError } = await supabase
      .from('patient_messages')
      .insert({
        conversation_id: conversationId,
        content: webhookData.message.body,
        sender_type: 'patient',
        sender_id: patient.id,
        message_type: webhookData.message.type.toLowerCase(),
        ghl_message_id: webhookData.messageId,
        sync_status: 'synced',
        ghl_sent_at: new Date(webhookData.message.dateAdded).toISOString(),
        metadata: {
          attachments: webhookData.message.attachments || [],
          webhook_data: webhookData
        }
      })
      .select()
      .single();

    if (messageError) {
      console.error('Message creation error:', messageError);
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Failed to create message' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Created message:', message.id);

    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Message processed',
      data: {
        messageId: message.id,
        conversationId: conversationId,
        patientId: patient.id
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);