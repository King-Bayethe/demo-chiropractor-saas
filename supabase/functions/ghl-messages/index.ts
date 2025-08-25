import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";

interface MessageData {
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
}

interface EnhancedMessage extends MessageData {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    if (!apiKey) {
      throw new Error('GoHighLevel API key not configured');
    }

    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const lastMessageId = url.searchParams.get('lastMessageId');
    const limit = url.searchParams.get('limit') || '20';
    
    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching messages for conversation: ${conversationId}`);

    // Build the messages endpoint URL
    let messagesUrl = `${GHL_API_BASE}/conversations/${conversationId}/messages?limit=${limit}`;
    if (lastMessageId) {
      messagesUrl += `&lastMessageId=${lastMessageId}`;
    }

    const response = await fetch(messagesUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Messages fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    const messages: MessageData[] = data.messages || [];
    
    console.log(`Fetched ${messages.length} messages`);

    // Enhance messages with recording and transcription info
    const enhancedMessages: EnhancedMessage[] = await Promise.all(
      messages.map(async (message) => {
        const enhanced: EnhancedMessage = { ...message };

        // Check for recordings (calls and voicemails)
        const hasRecording = (
          message.type === 'TYPE_CALL' || 
          message.type === 'TYPE_VOICEMAIL'
        ) && (
          message.meta?.recordingUrl || 
          message.meta?.recordingId ||
          message.attachments?.some(att => att.type === 'audio')
        );

        if (hasRecording) {
          enhanced.hasRecording = true;
          enhanced.recordingData = {
            id: message.meta?.recordingId || message.id,
            url: message.meta?.recordingUrl || '',
            duration: message.meta?.duration
          };

          // Check if transcription is available
          if (message.meta?.transcription) {
            enhanced.hasTranscription = true;
            enhanced.transcriptionData = {
              text: message.meta.transcription
            };
          }
        }

        // Check for attachments that might be audio
        if (message.attachments) {
          message.attachments.forEach(attachment => {
            if (attachment.type === 'audio') {
              enhanced.hasRecording = true;
              if (!enhanced.recordingData) {
                enhanced.recordingData = {
                  id: attachment.id,
                  url: attachment.url
                };
              }
            }
          });
        }

        return enhanced;
      })
    );

    const result = {
      messages: enhancedMessages,
      conversationId,
      total: enhancedMessages.length,
      hasMore: data.hasMore || false,
      lastMessageId: enhancedMessages.length > 0 ? enhancedMessages[enhancedMessages.length - 1].id : null
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ghl-messages function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});