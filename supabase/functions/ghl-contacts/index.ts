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
    const { method } = req;
    const url = new URL(req.url);
    const contactId = url.pathname.split('/').pop();

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    if (method === 'GET') {
      // Fetch contacts or single contact
      const endpoint = contactId && contactId !== 'ghl-contacts' 
        ? `${GHL_API_BASE}/contacts/${contactId}`
        : `${GHL_API_BASE}/contacts/`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      console.log('GHL API Response status:', response.status);
      console.log('GHL API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GHL API Error:', response.status, errorText);
        throw new Error(`GoHighLevel API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('GHL API Response text:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Response text:', responseText);
        throw new Error(`Invalid JSON response from GoHighLevel API: ${responseText}`);
      }
      
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (method === 'POST') {
      // Create new contact
      const contactData: ContactData = await req.json();

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

    if (method === 'PATCH' || method === 'PUT') {
      // Update existing contact
      const contactData: ContactData = await req.json();

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