import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

interface MessageData {
  contactId: string;
  message: string;
  type?: 'SMS' | 'Email';
}

interface GHLConversation {
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GHL Conversations function called:', req.method, req.url);
    
    const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');
    
    if (!GHL_API_KEY) {
      console.error('Missing GOHIGHLEVEL_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'GoHighLevel API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { method } = req;
    const url = new URL(req.url);
    const conversationId = url.pathname.split('/').pop();

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'Accept': 'application/json',
    };

    if (method === 'GET') {
      console.log('Fetching conversations from GHL API...');
      
      // Fetch conversations or messages for specific conversation
      const endpoint = conversationId && conversationId !== 'ghl-conversations'
        ? `${GHL_API_BASE}/conversations/${conversationId}/messages`
        : `${GHL_API_BASE}/conversations/`;

      console.log('GHL API endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      console.log('GHL API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL API error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `GHL API error: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('GHL API response text length:', responseText.length);
        
        if (!responseText) {
          data = { conversations: [] };
        } else {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Error parsing GHL API response:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response from GHL API',
            details: parseError.message 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      console.log('Successfully fetched conversations:', data?.conversations?.length || 0);

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST') {
      console.log('Sending message to GHL...');
      
      
      let messageData: MessageData;
      try {
        const requestText = await req.text();
        console.log('Received request body:', requestText);
        
        if (!requestText) {
          throw new Error('Empty request body');
        }
        
        // Try to parse as JSON first, but handle string bodies too
        try {
          messageData = JSON.parse(requestText);
        } catch (jsonError) {
          // If it's not JSON, maybe it's already an object
          messageData = requestText as any;
        }
        
        if (!messageData.contactId || !messageData.message) {
          throw new Error('Missing required fields: contactId and message');
        }
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid request body',
            details: parseError.message 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      const endpoint = `${GHL_API_BASE}/conversations/messages`;
      
      const ghlMessage = {
        contactId: messageData.contactId,
        message: messageData.message,
        type: messageData.type || 'SMS',
      };

      console.log('Sending message to GHL:', { contactId: messageData.contactId, type: ghlMessage.type });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(ghlMessage),
      });

      console.log('GHL message send response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL message send error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to send message: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      let data;
      try {
        const responseText = await response.text();
        if (!responseText) {
          data = { success: true };
        } else {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Error parsing message send response:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response from GHL API',
            details: parseError.message 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      console.log('Message sent successfully');

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in ghl-conversations function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);