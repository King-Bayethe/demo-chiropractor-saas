import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');

interface ContactData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{
    key: string;
    field_value: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // All Supabase function invocations come as POST, so we parse the body to get the intended action
    let requestData;
    try {
      const body = await req.text();
      requestData = body ? JSON.parse(body) : {};
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { method = 'GET', action, contactId, data } = requestData;
    console.log('Processing request:', { method, action, contactId });

    // Check if API key is configured
    if (!GHL_API_KEY) {
      console.error('GOHIGHLEVEL_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'GOHIGHLEVEL_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('API key found, length:', GHL_API_KEY.length);
    console.log('API key first 20 chars:', GHL_API_KEY.substring(0, 20) + '...');

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    if (method === 'GET' && (action === 'getById' || contactId)) {
      // Check if API key is configured
      if (!GHL_API_KEY) {
        throw new Error('GOHIGHLEVEL_API_KEY environment variable is not set');
      }

      // Fetch single contact by ID
      const endpoint = `${GHL_API_BASE}/contacts/${contactId}`;
      
      console.log('Making request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      console.log('GHL API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL API Error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: `GoHighLevel API error: ${response.status}`, 
            details: errorText 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'GET' && (action === 'getAll' || !action)) {
      // Check if API key is configured
      if (!GHL_API_KEY) {
        throw new Error('GOHIGHLEVEL_API_KEY environment variable is not set');
      }

      // Search for all contacts using the new Search API
      const endpoint = `${GHL_API_BASE}/contacts/search`;
      
      console.log('Making request to:', endpoint);
      
      const searchBody = {
        // Empty search returns all contacts with pagination
        limit: 100,
        startAt: 0
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchBody),
      });

      console.log('GHL API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL API Error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: `GoHighLevel API error: ${response.status}`, 
            details: errorText,
            endpoint: endpoint 
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const responseText = await response.text();
      console.log('GHL API Response text length:', responseText.length);

      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from GHL API');
        return new Response(
          JSON.stringify({ 
            error: 'Empty response from GoHighLevel API',
            endpoint: endpoint 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Response text:', responseText);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid JSON response from GoHighLevel API',
            details: parseError.message,
            responseText: responseText.substring(0, 500) 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST' && action === 'create') {
      // Create new contact
      const contactData: ContactData = data;

      // Format data for GHL API
      const ghlContact = {
        firstName: contactData.firstName || contactData.name?.split(' ')[0] || '',
        lastName: contactData.lastName || contactData.name?.split(' ').slice(1).join(' ') || '',
        email: contactData.email,
        phone: contactData.phone,
        tags: contactData.tags || [],
        customFields: [
          ...(contactData.customFields || []),
          // Add language and referral source as custom fields
        ],
      };

      const response = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(ghlContact),
      });

      console.log('Create Contact Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL Create Contact Error:', response.status, errorText);
        throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if ((method === 'PATCH' || method === 'PUT') && action === 'update') {
      // Update existing contact
      const contactData: ContactData = data;

      const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL Update Contact Error:', response.status, errorText);
        throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

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
    console.error('Error in ghl-contacts function:', error);
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