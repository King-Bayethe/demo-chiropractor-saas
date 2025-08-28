import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PUT, GET, OPTIONS',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GHL Message Status function called:', req.method, req.url);
    
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

    const url = new URL(req.url);
    const messageId = url.pathname.split('/').pop();

    if (!messageId || messageId === 'ghl-message-status') {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'Accept': 'application/json',
    };

    if (req.method === 'GET') {
      // Get message status
      console.log('Fetching message status for:', messageId);
      
      const endpoint = `${GHL_API_BASE}/conversations/messages/${messageId}`;
      console.log('GHL API endpoint for message status:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      console.log('GHL message status response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL message status error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to get message status: ${response.status} ${response.statusText}`,
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
    }

    if (req.method === 'PUT') {
      // Update message status
      let requestBody;
      try {
        const bodyText = await req.text();
        requestBody = bodyText ? JSON.parse(bodyText) : {};
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid request body',
            details: error.message 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      console.log('Updating message status for:', messageId, 'with data:', requestBody);
      
      const endpoint = `${GHL_API_BASE}/conversations/messages/${messageId}`;
      console.log('GHL API endpoint for message status update:', endpoint);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('GHL message status update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL message status update error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            error: `Failed to update message status: ${response.status} ${response.statusText}`,
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
        console.error('Error parsing message status update response:', parseError);
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

      console.log('Message status updated successfully:', data);

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
    console.error('Unexpected error in ghl-message-status function:', error);
    
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