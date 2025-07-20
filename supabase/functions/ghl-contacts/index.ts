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

// Main request handler for the Deno function - v2
const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Safely parse the request body. Default to an empty object if body is empty or invalid.
    let requestData = {};
    try {
      const text = await req.text();
      if (text) {
        requestData = JSON.parse(text);
      }
    } catch (e) {
      // Ignore parsing errors for empty bodies, but log for debugging if needed
      console.warn("Could not parse request body, proceeding with empty data.", e.message);
    }

    const { action = 'getAll', contactId, data, filters, sort } = requestData;

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      const missingVar = !GHL_API_KEY ? 'GOHIGHLEVEL_API_KEY' : 'GOHIGHLEVEL_LOCATION_ID';
      console.error(`${missingVar} environment variable is not set`);
      return new Response(JSON.stringify({ error: `${missingVar} not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    // --- ACTION: Get All Contacts ---
    if (action === 'getAll') {
      const allContacts = [];
      let searchAfter: (string | number)[] | undefined = undefined;
      let total = 0;

      console.log(`Starting contact fetch with filters:`, filters);

      while (true) {
        const endpoint = `${GHL_API_BASE}/contacts/search`;
        const searchBody = {
          locationId: GHL_LOCATION_ID,
          pageLimit: 100,
          searchAfter: searchAfter,
          filters: filters || [],
          sort: sort || [{ field: "dateAdded", direction: "desc" }]
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(searchBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
        }

        const pageData = await response.json();
        
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

    // --- ACTION: Create a new Contact ---
    if (action === 'create' && data) {
      const endpoint = `${GHL_API_BASE}/contacts/`;
      const body = { ...data, locationId: GHL_LOCATION_ID };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GHL Create Contact Error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // --- ACTION: Update an existing Contact ---
    if (action === 'update' && contactId && data) {
        const endpoint = `${GHL_API_BASE}/contacts/${contactId}`;
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GHL Update Contact Error: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    return new Response(JSON.stringify({ error: 'Invalid action specified' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in ghl-contacts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
