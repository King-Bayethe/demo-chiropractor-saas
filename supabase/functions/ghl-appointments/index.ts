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
      'Version': '2021-04-15'
    };

    switch (action) {
      case 'getAll': {
        console.log('Fetching all appointments from GoHighLevel');
        
        // Get date range for appointments (30 days back and 90 days forward)
        const startTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endTime = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days forward
        
        // Fetch from GoHighLevel Calendar API using correct endpoint
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/appointments?locationId=${ghlLocationId}&startTime=${startTime}&endTime=${endTime}`,
          { headers: ghlHeaders }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error(`GoHighLevel API error: ${ghlResponse.status}`, errorText);
          throw new Error(`GoHighLevel API error: ${ghlResponse.status} - ${errorText}`);
        }

        const ghlData = await ghlResponse.json();
        const ghlEvents = ghlData.events || [];
        console.log(`Fetched ${ghlEvents.length} appointments from GoHighLevel`);

        // Fetch contact names for each appointment
        const appointmentsWithContacts = await Promise.all(
          ghlEvents.map(async (appointment: any) => {
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

        // Create in GoHighLevel using the correct payload structure
        const calendarId = data.calendarId || Deno.env.get('GOHIGHLEVEL_DEFAULT_CALENDAR_ID');
        if (!calendarId) {
          throw new Error('Calendar ID is required for appointment creation');
        }

        const ghlPayload = {
          title: appointmentData.title,
          calendarId,
          contactId: appointmentData.contact_id,
          startTime: appointmentData.start_time,
          endTime: appointmentData.end_time,
          appointmentStatus: appointmentData.status || 'new',
          notes: appointmentData.notes || '',
          address: appointmentData.location || '',
          ignoreDateRange: false,
          toNotify: true
        };

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
          throw new Error(`Failed to create appointment in GoHighLevel: ${ghlResponse.status}`);
        }

        const ghlResult = await ghlResponse.json();
        console.log('Created appointment in GoHighLevel:', ghlResult);

        // Store in local database
        const { data: localResult, error: localError } = await supabaseClient
          .from('appointments')
          .insert({
            ghl_appointment_id: ghlResult.id,
            title: appointmentData.title,
            contact_id: appointmentData.contact_id,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            status: appointmentData.status || 'scheduled',
            type: appointmentData.type || 'consultation',
            notes: appointmentData.notes,
            location: appointmentData.location,
            provider_id: appointmentData.provider_id
          })
          .select()
          .single();

        if (localError) {
          console.error('Error storing appointment locally:', localError);
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

        // Update in GoHighLevel
        const ghlPayload = {
          contactId: appointmentData.contact_id,
          startTime: appointmentData.start_time,
          endTime: appointmentData.end_time,
          title: appointmentData.title,
          appointmentStatus: appointmentData.status,
          notes: appointmentData.notes,
          location: appointmentData.location
        };

        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/${localAppointment.ghl_appointment_id}`,
          {
            method: 'PUT',
            headers: ghlHeaders,
            body: JSON.stringify(ghlPayload)
          }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error('GoHighLevel update error:', errorText);
          throw new Error(`Failed to update appointment in GoHighLevel: ${ghlResponse.status}`);
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
            type: appointmentData.type,
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
        
        // Fetch all events from GoHighLevel using correct endpoint
        const ghlResponse = await fetch(
          `https://services.leadconnectorhq.com/calendars/events/appointments?locationId=${ghlLocationId}&startTime=${startTime}&endTime=${endTime}`,
          { headers: ghlHeaders }
        );

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error(`GoHighLevel API error: ${ghlResponse.status}`, errorText);
          throw new Error(`GoHighLevel API error: ${ghlResponse.status} - ${errorText}`);
        }

        const ghlData = await ghlResponse.json();
        const ghlEvents = ghlData.events || [];
        
        let syncedCount = 0;
        let errorCount = 0;

        // Sync each GHL event to local database
        for (const event of ghlEvents) {
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
            totalEvents: ghlEvents.length
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