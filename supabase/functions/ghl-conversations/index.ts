import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');

interface MessageData {
  contactId: string;
  message: string;
  type?: 'SMS' | 'Email';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method } = req;
    const url = new URL(req.url);
    const conversationId = url.pathname.split('/').pop();

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    if (method === 'GET') {
      // Fetch conversations or messages for specific conversation
      const endpoint = conversationId && conversationId !== 'ghl-conversations'
        ? `${GHL_API_BASE}/conversations/${conversationId}/messages`
        : `${GHL_API_BASE}/conversations/`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST') {
      // Send new message
      const messageData: MessageData = await req.json();
      
      const endpoint = `${GHL_API_BASE}/conversations/messages`;
      
      const ghlMessage = {
        contactId: messageData.contactId,
        message: messageData.message,
        type: messageData.type || 'SMS',
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(ghlMessage),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error: any) {
    console.error('Error in ghl-conversations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);