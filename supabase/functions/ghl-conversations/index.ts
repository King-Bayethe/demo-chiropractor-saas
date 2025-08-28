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
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name?: string;
  }>;
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

    let requestBody;
    try {
      const bodyText = await req.text();
      requestBody = bodyText ? JSON.parse(bodyText) : {};
    } catch (error) {
      requestBody = {};
    }

    const { method } = requestBody;
    const url = new URL(req.url);
    const conversationId = url.pathname.split('/').pop();

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'Accept': 'application/json',
    };

    if (method === 'GET' || req.method === 'GET') {
      console.log('Fetching conversations from GHL API...');
      
      // Fetch conversations or messages for specific conversation
      if (conversationId && conversationId !== 'ghl-conversations') {
        // Get messages for specific conversation
        const endpoint = `${GHL_API_BASE}/conversations/${conversationId}/messages`;
        console.log('GHL API endpoint for messages:', endpoint);
        
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

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } else {
        // List all conversations using the conversations/search endpoint
        const GHL_LOCATION_ID = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
        if (!GHL_LOCATION_ID) {
          return new Response(
            JSON.stringify({ error: 'GOHIGHLEVEL_LOCATION_ID not configured' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        
        console.log('Searching conversations with location ID:', GHL_LOCATION_ID);
        
        // Use the conversations/search endpoint with query parameters
        const searchParams = new URLSearchParams({
          locationId: GHL_LOCATION_ID,
        });
        
        const endpoint = `${GHL_API_BASE}/conversations/search?${searchParams}`;
        console.log('GHL API endpoint for conversations search:', endpoint);

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
    }

    // Handle creating a new conversation
    if (requestBody?.action === 'create') {
      console.log('Creating new conversation:', requestBody);
      
      const endpoint = `${GHL_API_BASE}/conversations/`;
      
      const createPayload = {
        locationId: requestBody.locationId,
        contactId: requestBody.contactId
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(createPayload)
      });

      console.log('GHL conversation create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL conversation create error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to create conversation: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const data = await response.json();
      console.log('Conversation created successfully');

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle adding an inbound message
    if (requestBody?.action === 'addInbound') {
      console.log('Adding inbound message:', requestBody);
      
      const endpoint = `${GHL_API_BASE}/conversations/messages/inbound`;
      
      const inboundPayload = {
        type: requestBody.type || 'SMS',
        attachments: requestBody.attachments || [],
        message: requestBody.message,
        conversationId: requestBody.conversationId,
        conversationProviderId: requestBody.conversationProviderId,
        html: requestBody.html
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(inboundPayload)
      });

      console.log('GHL inbound message response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL inbound message error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to add inbound message: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const data = await response.json();
      console.log('Inbound message added successfully');

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle adding an external outbound call
    if (requestBody?.action === 'addOutboundCall') {
      console.log('Adding external outbound call:', requestBody);
      
      const endpoint = `${GHL_API_BASE}/conversations/messages/outbound`;
      
      const outboundPayload = {
        type: requestBody.type || 'Call',
        attachments: requestBody.attachments || [],
        conversationId: requestBody.conversationId,
        conversationProviderId: requestBody.conversationProviderId,
        altId: requestBody.altId,
        date: requestBody.date || new Date().toISOString()
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(outboundPayload)
      });

      console.log('GHL outbound call response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL outbound call error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to add outbound call: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const data = await response.json();
      console.log('Outbound call added successfully');

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST' || req.method === 'POST') {
      console.log('Sending message to GHL...');
      
      let messageData: MessageData;
      try {
        // Use the request body we already parsed
        messageData = requestBody;
        
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
        ...(messageData.attachments && { attachments: messageData.attachments }),
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