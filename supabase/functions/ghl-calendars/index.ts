import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Calendar {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  settings?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ghlApiKey = Deno.env.get('GHL_API_KEY');
    const ghlLocationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    if (!ghlApiKey || !ghlLocationId) {
      console.error('Missing GoHighLevel credentials');
      return new Response(
        JSON.stringify({ error: 'GoHighLevel credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body safely
    let requestBody = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action = 'getAll' } = requestBody as any;
    console.log(`Processing calendar action: ${action}`);

    const ghlHeaders = {
      'Authorization': `Bearer ${ghlApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-04-15'
    };

    switch (action) {
      case 'getAll': {
        console.log('Fetching all calendar groups from GoHighLevel');
        
        // First get calendar groups to find calendars
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/groups?locationId=${ghlLocationId}`,
          { headers: ghlHeaders }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error(`GoHighLevel API error: ${ghlResponse.status}`, errorText);
          throw new Error(`GoHighLevel API error: ${ghlResponse.status} - ${errorText}`);
        }

        const ghlData = await ghlResponse.json();
        const groups = ghlData.groups || [];
        console.log(`Fetched ${groups.length} calendar groups from GoHighLevel`);

        // Extract calendars from groups
        const calendars = [];
        for (const group of groups) {
          if (group.calendars && Array.isArray(group.calendars)) {
            calendars.push(...group.calendars);
          }
        }

        return new Response(
          JSON.stringify({
            calendars: calendars,
            groups: groups,
            total: calendars.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getById': {
        const { calendarId } = requestBody as any;
        console.log('Fetching calendar by ID:', calendarId);
        
        if (!calendarId) {
          throw new Error('Calendar ID is required');
        }
        
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/${calendarId}`,
          { headers: ghlHeaders }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error(`GoHighLevel API error: ${ghlResponse.status}`, errorText);
          throw new Error(`GoHighLevel API error: ${ghlResponse.status} - ${errorText}`);
        }

        const calendarData = await ghlResponse.json();
        console.log('Fetched calendar:', calendarData);

        return new Response(
          JSON.stringify(calendarData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getAvailableSlots': {
        const { calendarId, startDate, endDate } = requestBody as any;
        console.log('Fetching available slots for calendar:', calendarId, startDate, endDate);
        
        if (!calendarId) {
          throw new Error('Calendar ID is required for fetching available slots');
        }
        
        const params = new URLSearchParams({
          calendarId,
          startDate,
          endDate
        });

        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/free-slots?${params}`,
          { headers: ghlHeaders }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error(`GoHighLevel API error: ${ghlResponse.status}`, errorText);
          throw new Error(`GoHighLevel API error: ${ghlResponse.status} - ${errorText}`);
        }

        const slotsData = await ghlResponse.json();
        console.log('Fetched available slots:', slotsData);

        return new Response(
          JSON.stringify(slotsData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in ghl-calendars function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);