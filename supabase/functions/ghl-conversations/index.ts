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
        // List all conversations - use contacts search since GHL doesn't have a direct conversations list endpoint
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
        
        console.log('Fetching contacts to get conversations...');
        const endpoint = `${GHL_API_BASE}/contacts/search`;
        
        const searchBody = {
          locationId: GHL_LOCATION_ID,
          pageLimit: 100,
          filters: [],
          sort: [{ field: "dateUpdated", direction: "desc" }]
        };
        
        console.log('GHL API endpoint for contacts:', endpoint);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(searchBody),
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

         const contactsData = await response.json();
         console.log('Fetched contacts:', contactsData?.contacts?.length || 0);
         
         // Transform contacts data to conversations format
         // For now, return empty conversations since GHL doesn't have a direct conversations list
         // In a real implementation, you'd need to fetch conversation data for each contact
         const conversations = [];
         
         const result = {
           conversations,
           total: conversations.length,
           hasMore: false
         };

         return new Response(JSON.stringify(result), {
           status: 200,
           headers: { 'Content-Type': 'application/json', ...corsHeaders },
         });
       }
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