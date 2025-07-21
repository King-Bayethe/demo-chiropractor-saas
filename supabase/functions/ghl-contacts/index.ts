
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GHL API Configuration
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');
const GHL_LOCATION_ID = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

// Main request handler
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== GHL Contacts Function Called ===');
    console.log('Method:', req.method);
    
    // Check environment variables
    if (!GHL_API_KEY) {
      console.error('GOHIGHLEVEL_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'GOHIGHLEVEL_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!GHL_LOCATION_ID) {
      console.error('GOHIGHLEVEL_LOCATION_ID is not set');
      return new Response(JSON.stringify({ error: 'GOHIGHLEVEL_LOCATION_ID not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('API Key length:', GHL_API_KEY.length);
    console.log('Location ID:', GHL_LOCATION_ID);

    // Parse request body
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

    const { action = 'getAll', contactId, data, filters, sort } = requestData;

    // Set up headers for GHL API
    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    // Handle different actions
    if (action === 'getAll') {
      console.log('Fetching all contacts...');
      
      const allContacts = [];
      let searchAfter: (string | number)[] | undefined = undefined;
      let total = 0;

      while (true) {
        const endpoint = `${GHL_API_BASE}/contacts/search`;
        const searchBody = {
          locationId: GHL_LOCATION_ID,
          pageLimit: 100,
          searchAfter: searchAfter,
          filters: filters || [],
          sort: sort || [{ field: "dateAdded", direction: "desc" }]
        };

        console.log('Making request to:', endpoint);
        console.log('Request body:', JSON.stringify(searchBody, null, 2));

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(searchBody),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('GHL API Error:', response.status, errorText);
          throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
        }

        const pageData = await response.json();
        console.log('Page data received:', {
          contactsCount: pageData.contacts?.length || 0,
          total: pageData.total,
          searchAfter: pageData.searchAfter
        });
        
        if (pageData.contacts && pageData.contacts.length > 0) {
          allContacts.push(...pageData.contacts);
        }
        
        total = pageData.total || allContacts.length;

        if (pageData.searchAfter && pageData.contacts.length > 0) {
          searchAfter = pageData.searchAfter;
        } else {
          break;
        }
      }
      
      console.log(`Total contacts fetched: ${allContacts.length}`);
      
      return new Response(JSON.stringify({ contacts: allContacts, total: total }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle create contact
    if (action === 'create' && data) {
      console.log('Creating new contact:', data);
      
      const endpoint = `${GHL_API_BASE}/contacts/`;
      const body = { ...data, locationId: GHL_LOCATION_ID };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('Create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create contact error:', response.status, errorText);
        throw new Error(`GHL Create Contact Error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Contact created successfully:', responseData);
      
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle update contact
    if (action === 'update' && contactId && data) {
      console.log('Updating contact:', contactId, data);
      
      const endpoint = `${GHL_API_BASE}/contacts/${contactId}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update contact error:', response.status, errorText);
        throw new Error(`GHL Update Contact Error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Contact updated successfully:', responseData);
      
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Invalid action
    console.error('Invalid action specified:', action);
    return new Response(JSON.stringify({ error: 'Invalid action specified' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in ghl-contacts function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
