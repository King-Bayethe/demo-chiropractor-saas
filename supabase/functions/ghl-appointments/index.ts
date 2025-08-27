import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentData {
  id?: string;
  title: string;
  contact_id: string;
  start_time: string;
  end_time: string;
  status?: string;
  type?: string;
  notes?: string;
  location?: string;
  provider_id?: string;
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

    const ghlApiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    const ghlLocationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    if (!ghlApiKey || !ghlLocationId) {
      console.error('Missing GoHighLevel credentials');
      return new Response(
        JSON.stringify({ error: 'GoHighLevel credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body safely
    let requestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        throw new Error('Empty request body');
      }
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...data } = requestBody;
    console.log(`Processing appointment action: ${action}`, data);

    const ghlHeaders = {
      'Authorization': `Bearer ${ghlApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    };

    switch (action) {
      case 'getAll': {
        console.log('Fetching all appointments from GoHighLevel');
        
        // Get date range for appointments (30 days back and 90 days forward)
        const startTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endTime = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days forward
        
        // First, get calendar groups to find available calendars
        const groupsResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/groups?locationId=${ghlLocationId}`,
          { headers: ghlHeaders }
        );

        if (!groupsResponse.ok) {
          const errorText = await groupsResponse.text();
          console.error(`GoHighLevel Groups API error: ${groupsResponse.status}`, errorText);
          throw new Error(`GoHighLevel Groups API error: ${groupsResponse.status} - ${errorText}`);
        }

        const groupsData = await groupsResponse.json();
        const groups = groupsData.groups || [];
        console.log(`Found ${groups.length} calendar groups`);

        let allEvents = [];

        // Fetch events for each group
        for (const group of groups) {
          try {
            console.log(`Fetching events for group: ${group.id}`);
            const eventsResponse = await fetch(
              `https://services.leadconnectorhq.com/calendars/events?groupId=${group.id}&startTime=${startTime}&endTime=${endTime}`,
              { headers: ghlHeaders }
            );

            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              const events = eventsData.events || [];
              allEvents.push(...events);
              console.log(`Fetched ${events.length} events from group ${group.id}`);
            } else {
              console.warn(`Failed to fetch events for group ${group.id}: ${eventsResponse.status}`);
            }
          } catch (error) {
            console.error(`Error fetching events for group ${group.id}:`, error);
          }
        }

        console.log(`Total events fetched: ${allEvents.length}`);

        // Fetch contact names for each appointment
        const appointmentsWithContacts = await Promise.all(
          allEvents.map(async (appointment: any) => {
            if (!appointment.contactId) {
              return { ...appointment, contactName: '' };
            }

            try {
              // Fetch contact details from GHL Contacts API
              const contactResponse = await fetch(
                `https://services.leadconnectorhq.com/contacts/${appointment.contactId}`,
                { headers: ghlHeaders }
              );

              if (contactResponse.ok) {
                const contactData = await contactResponse.json();
                const contactName = `${contactData.contact?.firstName || ''} ${contactData.contact?.lastName || ''}`.trim() || 
                                  contactData.contact?.email || 
                                  'Unknown Contact';
                
                return { ...appointment, contactName };
              } else {
                console.warn(`Failed to fetch contact ${appointment.contactId}`);
                return { ...appointment, contactName: 'Unknown Contact' };
              }
            } catch (error) {
              console.error(`Error fetching contact ${appointment.contactId}:`, error);
              return { ...appointment, contactName: 'Unknown Contact' };
            }
          })
        );

        // Also fetch from local database
        const { data: localAppointments, error: localError } = await supabaseClient
          .from('appointments')
          .select(`
            *,
            appointment_notes(*)
          `)
          .order('start_time', { ascending: true });

        if (localError) {
          console.error('Error fetching local appointments:', localError);
        }

        return new Response(
          JSON.stringify({
            appointments: appointmentsWithContacts,
            localAppointments: localAppointments || [],
            total: appointmentsWithContacts.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        const appointmentData: AppointmentData = data.appointmentData;
        console.log('Creating appointment:', appointmentData);

        // Validate required fields
        if (!appointmentData.contact_id) {
          throw new Error('Contact ID is required for appointment creation');
        }
        if (!appointmentData.start_time || !appointmentData.end_time) {
          throw new Error('Start time and end time are required');
        }

        // Get calendar ID - either from data or use default
        let calendarId = data.calendarId || appointmentData.calendarId || Deno.env.get('GOHIGHLEVEL_DEFAULT_CALENDAR_ID');
        
        // If no calendar ID provided, use the calendar group ID to get available calendars
        if (!calendarId) {
          const calendarGroupId = Deno.env.get('CALENDAR_GROUP_ID');
          console.log('No calendar ID provided, using calendar group ID:', calendarGroupId);
          
          if (calendarGroupId) {
            try {
              // Get calendars from the specific group
              const calendarsResponse = await fetch(
                `https://services.leadconnectorhq.com/calendars/groups/${calendarGroupId}/calendars`,
                { headers: ghlHeaders }
              );
              
              if (calendarsResponse.ok) {
                const calendarsData = await calendarsResponse.json();
                const calendars = calendarsData.calendars || [];
                console.log(`Found ${calendars.length} calendars in group ${calendarGroupId}`);
                
                // Use the first available calendar
                if (calendars.length > 0) {
                  calendarId = calendars[0].id;
                  console.log(`Using calendar ID: ${calendarId}`);
                }
              } else {
                console.error(`Failed to fetch calendars for group ${calendarGroupId}: ${calendarsResponse.status}`);
              }
            } catch (error) {
              console.error('Error fetching calendars from group:', error);
            }
          }
          
          // Fallback: try to get the first available calendar from all groups
          if (!calendarId) {
            console.log('Fallback: fetching all calendar groups');
            try {
              const groupsResponse = await fetch(
                `https://services.leadconnectorhq.com/calendars/groups?locationId=${ghlLocationId}`,
                { headers: ghlHeaders }
              );
              
              if (groupsResponse.ok) {
                const groupsData = await groupsResponse.json();
                const groups = groupsData.groups || [];
                console.log(`Found ${groups.length} calendar groups`);
                
                // Try to find a calendar in the first group
                if (groups.length > 0) {
                  const firstGroup = groups[0];
                  if (firstGroup.calendars && firstGroup.calendars.length > 0) {
                    calendarId = firstGroup.calendars[0].id;
                    console.log(`Using fallback calendar ID: ${calendarId}`);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching calendar groups:', error);
            }
          }
        }
        
        if (!calendarId) {
          throw new Error('No calendar ID available for appointment creation. Please configure GOHIGHLEVEL_DEFAULT_CALENDAR_ID or ensure calendars are available.');
        }

        // Convert ISO datetime to Unix timestamp (required by GHL)
        const startTimeUnix = Math.floor(new Date(appointmentData.start_time).getTime() / 1000);
        const endTimeUnix = Math.floor(new Date(appointmentData.end_time).getTime() / 1000);

        // Create in GoHighLevel using the correct payload structure
        const ghlPayload = {
          calendarId,
          contactId: appointmentData.contact_id,
          startTime: startTimeUnix,
          endTime: endTimeUnix,
          title: appointmentData.title || 'Appointment',
          appointmentStatus: appointmentData.status || 'new',
          address: appointmentData.location || '',
          ignoreDateRange: false,
          toNotify: true
        };

        console.log('GHL appointment payload:', ghlPayload);

        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/appointments`,
          {
            method: 'POST',
            headers: ghlHeaders,
            body: JSON.stringify(ghlPayload)
          }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error('GoHighLevel create error:', errorText);
          
          // Provide specific error messages for common issues
          if (ghlResponse.status === 403) {
            const errorData = JSON.parse(errorText);
            
            // More specific error based on the actual error message
            if (errorData.message && errorData.message.includes('token does not have access to this location')) {
              throw new Error(`Calendar Permission Error: Your GoHighLevel API key works for contacts but lacks calendar/appointment permissions for location ${ghlLocationId}. 
              
To fix this:
1. In GoHighLevel, go to Settings > API
2. Edit your API key permissions 
3. Enable "Calendar" and "Appointment" scopes
4. Or create a new API key with calendar permissions
5. Update the GOHIGHLEVEL_API_KEY secret in Supabase

Note: Contact features work because your API key has contact permissions, but calendar operations require additional permissions.`);
            } else {
              throw new Error(`Authentication failed: The API key does not have access to this location (${ghlLocationId}). Please verify that your GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID are correctly paired in Supabase secrets.`);
            }
          } else if (ghlResponse.status === 401) {
            throw new Error(`Authentication failed: Invalid API key. Please check your GOHIGHLEVEL_API_KEY in Supabase secrets.`);
          } else if (ghlResponse.status === 400) {
            throw new Error(`Bad request: ${errorText}. Please check your appointment data.`);
          } else {
            throw new Error(`Failed to create appointment in GoHighLevel: ${ghlResponse.status} - ${errorText}`);
          }
        }

        const ghlResult = await ghlResponse.json();
        console.log('Created appointment in GoHighLevel:', ghlResult);

        // Store in local database
        const { data: localResult, error: localError } = await supabaseClient
          .from('appointments')
          .insert({
            ghl_appointment_id: ghlResult.id || ghlResult.eventId,
            title: appointmentData.title || 'Appointment',
            contact_id: appointmentData.contact_id,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            status: appointmentData.status || 'scheduled',
            appointment_type: appointmentData.type || 'consultation',
            notes: appointmentData.notes,
            location: appointmentData.location,
            provider_id: appointmentData.provider_id,
            patient_name: ghlResult.contactName || 'Unknown',
            patient_email: ghlResult.contactEmail || null,
            patient_phone: ghlResult.contactPhone || null
          })
          .select()
          .single();

        if (localError) {
          console.error('Error storing appointment locally:', localError);
          // Don't throw here - the GHL appointment was created successfully
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            ghlAppointment: ghlResult,
            localAppointment: localResult,
            message: 'Appointment created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const { appointmentId, appointmentData } = data;
        console.log('Updating appointment:', appointmentId, appointmentData);

        // Get local appointment to find GHL ID
        const { data: localAppointment, error: fetchError } = await supabaseClient
          .from('appointments')
          .select('ghl_appointment_id')
          .eq('id', appointmentId)
          .single();

        if (fetchError || !localAppointment?.ghl_appointment_id) {
          console.error('Could not find GHL appointment ID:', fetchError);
          return new Response(
            JSON.stringify({ error: 'Appointment not found or missing GHL ID' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Convert ISO datetime to Unix timestamp if provided
        const updatePayload: any = {};
        if (appointmentData.contact_id) updatePayload.contactId = appointmentData.contact_id;
        if (appointmentData.start_time) updatePayload.startTime = Math.floor(new Date(appointmentData.start_time).getTime() / 1000);
        if (appointmentData.end_time) updatePayload.endTime = Math.floor(new Date(appointmentData.end_time).getTime() / 1000);
        if (appointmentData.title) updatePayload.title = appointmentData.title;
        if (appointmentData.status) updatePayload.appointmentStatus = appointmentData.status;
        if (appointmentData.notes) updatePayload.notes = appointmentData.notes;
        if (appointmentData.location) updatePayload.address = appointmentData.location;

        console.log('GHL update payload:', updatePayload);

        // Update in GoHighLevel
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/${localAppointment.ghl_appointment_id}`,
          {
            method: 'PUT',
            headers: ghlHeaders,
            body: JSON.stringify(updatePayload)
          }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error('GoHighLevel update error:', errorText);
          throw new Error(`Failed to update appointment in GoHighLevel: ${ghlResponse.status} - ${errorText}`);
        }

        const ghlResult = await ghlResponse.json();

        // Update local database
        const { data: localResult, error: localError } = await supabaseClient
          .from('appointments')
          .update({
            title: appointmentData.title,
            contact_id: appointmentData.contact_id,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            status: appointmentData.status,
            appointment_type: appointmentData.type,
            notes: appointmentData.notes,
            location: appointmentData.location,
            provider_id: appointmentData.provider_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
          .select()
          .single();

        if (localError) {
          console.error('Error updating appointment locally:', localError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            ghlAppointment: ghlResult,
            localAppointment: localResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { appointmentId } = data;
        console.log('Deleting appointment:', appointmentId);

        // Get local appointment to find GHL ID
        const { data: localAppointment, error: fetchError } = await supabaseClient
          .from('appointments')
          .select('ghl_appointment_id')
          .eq('id', appointmentId)
          .single();

        if (fetchError || !localAppointment?.ghl_appointment_id) {
          console.error('Could not find GHL appointment ID:', fetchError);
          return new Response(
            JSON.stringify({ error: 'Appointment not found or missing GHL ID' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete from GoHighLevel
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/${localAppointment.ghl_appointment_id}`,
          {
            method: 'DELETE',
            headers: ghlHeaders
          }
        );

        if (!ghlResponse.ok) {
          console.error('GoHighLevel delete error:', ghlResponse.status);
          throw new Error(`Failed to delete appointment in GoHighLevel: ${ghlResponse.status}`);
        }

        // Delete from local database
        const { error: localError } = await supabaseClient
          .from('appointments')
          .delete()
          .eq('id', appointmentId);

        if (localError) {
          console.error('Error deleting appointment locally:', localError);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        console.log('Syncing appointments with GoHighLevel');
        
        // Get date range for sync (30 days back and 90 days forward)
        const startTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endTime = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days forward
        
        // First, get calendar groups to find available calendars
        const groupsResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/groups?locationId=${ghlLocationId}`,
          { headers: ghlHeaders }
        );

        if (!groupsResponse.ok) {
          const errorText = await groupsResponse.text();
          console.error(`GoHighLevel Groups API error: ${groupsResponse.status}`, errorText);
          throw new Error(`GoHighLevel Groups API error: ${groupsResponse.status} - ${errorText}`);
        }

        const groupsData = await groupsResponse.json();
        const groups = groupsData.groups || [];

        let allEvents = [];

        // Fetch events for each group
        for (const group of groups) {
          try {
            const eventsResponse = await fetch(
              `https://services.leadconnectorhq.com/calendars/events?groupId=${group.id}&startTime=${startTime}&endTime=${endTime}`,
              { headers: ghlHeaders }
            );

            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json();
              const events = eventsData.events || [];
              allEvents.push(...events);
            }
          } catch (error) {
            console.error(`Error fetching events for group ${group.id}:`, error);
          }
        }
        
        let syncedCount = 0;
        let errorCount = 0;

        // Sync each GHL event to local database
        for (const event of allEvents) {
          try {
            const { error } = await supabaseClient
              .from('appointments')
              .upsert({
                ghl_appointment_id: event.id,
                title: event.title,
                contact_id: event.contactId,
                start_time: event.startTime,
                end_time: event.endTime,
                status: event.appointmentStatus || 'scheduled',
                type: 'consultation',
                notes: event.notes,
                location: event.location,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'ghl_appointment_id'
              });

            if (error) {
              console.error(`Error syncing appointment ${event.id}:`, error);
              errorCount++;
            } else {
              syncedCount++;
            }
          } catch (error) {
            console.error(`Exception syncing appointment ${event.id}:`, error);
            errorCount++;
          }
        }

        console.log(`Sync completed: ${syncedCount} synced, ${errorCount} errors`);

        return new Response(
          JSON.stringify({
            success: true,
            syncedCount,
            errorCount,
            totalEvents: allEvents.length
          }),
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
    console.error('Error in ghl-appointments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);