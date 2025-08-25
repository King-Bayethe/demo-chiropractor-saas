
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

    // Parse request body for POST requests, use URL params for GET requests
    let requestData = {};
    
    if (req.method === 'GET') {
      // For GET requests, parse URL parameters
      const url = new URL(req.url);
      const action = url.searchParams.get('action') || 'getAll';
      const searchAfter = url.searchParams.get('searchAfter');
      const pageLimit = url.searchParams.get('pageLimit');
      
      requestData = {
        action,
        searchAfter: searchAfter ? JSON.parse(searchAfter) : undefined,
        pageLimit: pageLimit ? parseInt(pageLimit) : 100
      };
    } else if (req.method === 'POST') {
      // For POST requests, parse JSON body
      try {
        const text = await req.text();
        if (text) {
          requestData = JSON.parse(text);
        }
      } catch (e) {
        console.warn('Could not parse request body:', e.message);
      }
    }

    console.log('Request method:', req.method);
    console.log('Request data:', requestData);

    const { action = 'getAll', contactId, data, filters, sort, searchAfter: clientSearchAfter, pageLimit = 100 } = requestData;

    // Set up headers for GHL API
    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    // Handle different actions
    if (action === 'getAll') {
      console.log('Fetching contacts with batch processing...');
      console.log('Client searchAfter:', clientSearchAfter);
      console.log('Page limit:', pageLimit);
      
      const endpoint = `${GHL_API_BASE}/contacts/search`;
      const searchBody = {
        locationId: GHL_LOCATION_ID,
        pageLimit: Math.min(pageLimit, 500), // Ensure we don't exceed API limits
        searchAfter: clientSearchAfter,
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
      
      return new Response(JSON.stringify({ 
        contacts: pageData.contacts || [], 
        total: pageData.total || 0,
        searchAfter: pageData.searchAfter 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Handle get contact by ID
    if (action === 'getById' && contactId) {
      console.log('Fetching contact by ID:', contactId);
      
      const endpoint = `${GHL_API_BASE}/contacts/${contactId}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      console.log('Get by ID response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL API Error:', response.status, errorText);
        throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
      }

      const contactData = await response.json();
      console.log('Contact fetched successfully:', contactData.id);
      
      return new Response(JSON.stringify(contactData), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    if (action === 'create' && data) {
      console.log('Creating new contact:', data);
      const { patientId, ...contactData } = data;
      
      const endpoint = `${GHL_API_BASE}/contacts/`;
      const body = { ...contactData, locationId: GHL_LOCATION_ID };
      
      console.log('Sending contact data to GHL:', body);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('Create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create contact error:', response.status, errorText);
        
        // If this is from a patient sync, we should update the patient record
        if (patientId) {
          console.log('Updating patient with sync error:', patientId);
          // Note: In a real implementation, you might want to update the patient record
          // to indicate the sync failed, but for now we'll just log it
        }
        
        throw new Error(`GHL Create Contact Error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Contact created successfully:', responseData);
      
      // If this was triggered by a patient sync, update the patient record with the GHL contact ID
      if (patientId && responseData.contact?.id) {
        console.log('Patient sync successful - GHL Contact ID:', responseData.contact.id);
        console.log('Patient ID:', patientId);
        
        // You could add logic here to update the patient record with the GHL contact ID
        // using a Supabase client if needed
      }
      
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
