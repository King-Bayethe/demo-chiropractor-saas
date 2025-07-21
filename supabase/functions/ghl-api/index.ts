/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== New GHL API Function Called ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);

    const apiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    console.log('Environment check:');
    console.log('- API Key exists:', !!apiKey);
    console.log('- Location ID exists:', !!locationId);

    if (!apiKey) {
      console.error('Missing GOHIGHLEVEL_API_KEY');
      return new Response(JSON.stringify({ 
        error: 'GOHIGHLEVEL_API_KEY not configured',
        details: 'Please set the API key in Supabase secrets'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!locationId) {
      console.error('Missing GOHIGHLEVEL_LOCATION_ID');
      return new Response(JSON.stringify({ 
        error: 'GOHIGHLEVEL_LOCATION_ID not configured',
        details: 'Please set the location ID in Supabase secrets'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let requestData = {};
    try {
      const text = await req.text();
      if (text) {
        requestData = JSON.parse(text);
      }
    } catch (e) {
      console.warn('Could not parse request body:', e.message);
    }

    console.log('Request data:', requestData);

    const { action = 'getAll', contactId, data } = requestData as any;

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    console.log('Making GHL API request with action:', action);

    if (action === 'getAll') {
      const endpoint = `${GHL_API_BASE}/contacts/search`;
      const searchBody = {
        locationId: locationId,
        pageLimit: 100,
        filters: [],
        sort: [{ field: "dateAdded", direction: "desc" }]
      };

      console.log('Endpoint:', endpoint);
      console.log('Search body:', JSON.stringify(searchBody, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchBody),
      });

      console.log('GHL Response status:', response.status);
      console.log('GHL Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('GHL Response body:', responseText);

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.status} - ${responseText}`);
      }

      const responseData = JSON.parse(responseText);
      
      return new Response(JSON.stringify({
        contacts: responseData.contacts || [],
        total: responseData.total || 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'create' && data) {
      const endpoint = `${GHL_API_BASE}/contacts/`;
      const body = { ...data, locationId: locationId };
      
      console.log('Creating contact:', JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      console.log('Create response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`GHL Create Error: ${response.status} - ${responseText}`);
      }
      
      const responseData = JSON.parse(responseText);
      
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (action === 'update' && contactId && data) {
      const endpoint = `${GHL_API_BASE}/contacts/${contactId}`;
      
      console.log('Updating contact:', contactId, JSON.stringify(data, null, 2));

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log('Update response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`GHL Update Error: ${response.status} - ${responseText}`);
      }
      
      const responseData = JSON.parse(responseText);
      
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);