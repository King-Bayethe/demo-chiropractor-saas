import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ghlApiKey = Deno.env.get('GHL_API_KEY');
    const ghlLocationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    const ghlDefaultCalendarId = Deno.env.get('GOHIGHLEVEL_DEFAULT_CALENDAR_ID');

    console.log('Starting GoHighLevel health check...');
    console.log('API Key present:', !!ghlApiKey);
    console.log('Location ID present:', !!ghlLocationId);
    console.log('Default Calendar ID present:', !!ghlDefaultCalendarId);

    const results = {
      credentials: {
        apiKey: !!ghlApiKey,
        locationId: !!ghlLocationId,
        defaultCalendarId: !!ghlDefaultCalendarId
      },
      tests: {
        calendarGroups: { status: 'pending', error: null },
        locationAccess: { status: 'pending', error: null },
        calendarAccess: { status: 'pending', error: null }
      },
      summary: {
        overall: 'pending',
        message: ''
      }
    };

    if (!ghlApiKey || !ghlLocationId) {
      results.summary.overall = 'failed';
      results.summary.message = 'Missing required GoHighLevel credentials. Please configure GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID in Supabase secrets.';
      
      return new Response(
        JSON.stringify(results),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ghlHeaders = {
      'Authorization': `Bearer ${ghlApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-04-15'
    };

    // Test 1: Check if we can access calendar groups for this location
    try {
      console.log('Testing calendar groups access...');
      const groupsResponse = await fetch(
        `https://services.leadconnectorhq.com/calendars/groups?locationId=${ghlLocationId}`,
        { headers: ghlHeaders }
      );

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const groups = groupsData.groups || [];
        results.tests.calendarGroups.status = 'passed';
        results.tests.locationAccess.status = 'passed';
        
        console.log(`Found ${groups.length} calendar groups`);
        
        // Test 2: Check if we can access calendars
        let totalCalendars = 0;
        let defaultCalendarFound = false;
        
        for (const group of groups) {
          if (group.calendars && Array.isArray(group.calendars)) {
            totalCalendars += group.calendars.length;
            
            // Check if default calendar exists
            if (ghlDefaultCalendarId) {
              const foundCalendar = group.calendars.find(cal => cal.id === ghlDefaultCalendarId);
              if (foundCalendar) {
                defaultCalendarFound = true;
              }
            }
          }
        }
        
        results.tests.calendarAccess.status = totalCalendars > 0 ? 'passed' : 'warning';
        
        if (totalCalendars === 0) {
          results.tests.calendarAccess.error = 'No calendars found in any groups';
        }
        
        // Overall summary
        if (totalCalendars > 0) {
          results.summary.overall = 'passed';
          results.summary.message = `API connection successful. Found ${groups.length} calendar groups with ${totalCalendars} total calendars.`;
          
          if (ghlDefaultCalendarId && !defaultCalendarFound) {
            results.summary.message += ` Warning: Default calendar ID (${ghlDefaultCalendarId}) not found in available calendars.`;
          } else if (ghlDefaultCalendarId && defaultCalendarFound) {
            results.summary.message += ` Default calendar verified.`;
          }
        } else {
          results.summary.overall = 'warning';
          results.summary.message = 'API connection successful but no calendars available for this location.';
        }
        
      } else {
        const errorText = await groupsResponse.text();
        console.error('Calendar groups API error:', groupsResponse.status, errorText);
        
        results.tests.calendarGroups.status = 'failed';
        results.tests.calendarGroups.error = `HTTP ${groupsResponse.status}: ${errorText}`;
        
        if (groupsResponse.status === 403) {
          results.tests.locationAccess.status = 'failed';
          results.tests.locationAccess.error = 'API key does not have access to this location';
          results.summary.overall = 'failed';
          results.summary.message = 'Authentication failed: The API key does not have access to the specified location. Please verify that the GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID are correctly paired and the API key has the necessary permissions.';
        } else {
          results.summary.overall = 'failed';
          results.summary.message = `API request failed with status ${groupsResponse.status}. Check your API key and location ID.`;
        }
      }
    } catch (error) {
      console.error('Network error during health check:', error);
      results.tests.calendarGroups.status = 'failed';
      results.tests.calendarGroups.error = `Network error: ${error.message}`;
      results.summary.overall = 'failed';
      results.summary.message = 'Network error occurred while testing GoHighLevel connection.';
    }

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ghl-health-check function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: {
          overall: 'failed',
          message: 'Health check failed due to an unexpected error.'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);