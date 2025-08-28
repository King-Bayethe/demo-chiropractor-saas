import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('GHL File Upload function called:', req.method, req.url);
    
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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'No conversation ID provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Uploading file to GHL:', { fileName: file.name, size: file.size, type: file.type });

    // Prepare the form data for GHL API
    const ghlFormData = new FormData();
    ghlFormData.append('file', file);
    ghlFormData.append('conversationId', conversationId);

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
    };

    // Upload file to GHL
    const endpoint = `${GHL_API_BASE}/conversations/messages/upload`;
    console.log('GHL API endpoint for file upload:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: ghlFormData,
    });

    console.log('GHL file upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GHL file upload error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to upload file: ${response.status} ${response.statusText}`,
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
      console.error('Error parsing file upload response:', parseError);
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

    console.log('File uploaded successfully:', data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Unexpected error in ghl-file-upload function:', error);
    
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