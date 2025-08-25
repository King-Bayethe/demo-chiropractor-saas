import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const ghlApiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    const ghlLocationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    
    if (!ghlApiKey || !ghlLocationId) {
      console.error('Missing GoHighLevel API configuration');
      return new Response(JSON.stringify({
        error: 'Missing GoHighLevel API configuration'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const { conversationId } = await req.json();
    
    if (!conversationId) {
      return new Response(JSON.stringify({
        error: 'conversationId is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Fetching messages for conversation: ${conversationId}`);

    // Fetch messages from GoHighLevel API
    const response = await fetch(`https://services.leadconnectorhq.com/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      console.error(`GoHighLevel API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return new Response(JSON.stringify({
        error: `GoHighLevel API error: ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const data = await response.json();
    console.log('GoHighLevel API response:', JSON.stringify(data, null, 2));

    // Extract messages from the nested structure and return them directly
    const messages = data?.messages?.messages || data?.messages || [];

    return new Response(JSON.stringify({
      messages
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in ghl-messages function:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});