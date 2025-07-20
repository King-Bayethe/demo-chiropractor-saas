import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');

interface EmailData {
  contactId: string;
  subject: string;
  html?: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method } = req;

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    if (method === 'GET') {
      // Fetch email history - may need to use conversations endpoint
      const response = await fetch(`${GHL_API_BASE}/conversations/`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      // Filter for email conversations only
      const emailConversations = data.conversations?.filter((conv: any) => 
        conv.type === 'Email' || conv.lastMessage?.type === 'Email'
      ) || [];

      return new Response(JSON.stringify({ emails: emailConversations }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST') {
      // Send email
      const emailData: EmailData = await req.json();
      
      const ghlEmail = {
        contactId: emailData.contactId,
        message: emailData.html,
        subject: emailData.subject,
        type: 'Email',
        attachments: emailData.attachments || [],
      };

      const response = await fetch(`${GHL_API_BASE}/conversations/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ghlEmail),
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
    console.error('Error in ghl-emails function:', error);
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