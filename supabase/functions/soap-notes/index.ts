import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SOAPNoteData {
  patient_id: string;
  provider_id: string;
  provider_name: string;
  appointment_id?: string;
  date_of_service?: string;
  chief_complaint?: string;
  is_draft?: boolean;
  subjective_data: any;
  objective_data: any;
  assessment_data: any;
  plan_data: any;
  vital_signs?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { method, url } = req;
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    console.log('Request URL:', url);
    console.log('Path segments:', pathSegments);
    
    // For requests like /soap-notes/{id}, get the ID from the path
    // The path will be something like ['functions', 'v1', 'soap-notes', 'note-id']
    const noteId = pathSegments.length > 3 ? pathSegments[3] : null;
    
    console.log('Parsed note ID:', noteId);

    switch (method) {
      case 'GET':
        if (noteId && noteId !== 'soap-notes') {
          // Get specific SOAP note
          console.log('Fetching SOAP note with ID:', noteId);
          const { data: note, error } = await supabaseClient
            .from('soap_notes')
            .select(`
              *,
              patients(id, first_name, last_name, email)
            `)
            .eq('id', noteId)
            .maybeSingle();

          if (error) {
            console.error('Error fetching SOAP note:', error);
            return new Response(
              JSON.stringify({ error: 'Failed to fetch SOAP note', details: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (!note) {
            console.log('SOAP note not found with ID:', noteId);
            return new Response(
              JSON.stringify({ error: 'SOAP note not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ data: note }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all SOAP notes with pagination
          const limit = parseInt(urlObj.searchParams.get('limit') || '50');
          const offset = parseInt(urlObj.searchParams.get('offset') || '0');
          const searchTerm = urlObj.searchParams.get('search') || '';

          console.log('Fetching SOAP notes with params:', { limit, offset, searchTerm });
          let query = supabaseClient
            .from('soap_notes')
            .select(`
              *,
              patients(id, first_name, last_name, email)
            `, { count: 'exact' })
            .order('date_of_service', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (searchTerm) {
            query = query.or(`chief_complaint.ilike.%${searchTerm}%,provider_name.ilike.%${searchTerm}%`);
          }

          const { data: notes, error, count } = await query;

          if (error) {
            console.error('Error fetching SOAP notes:', error);
            return new Response(
              JSON.stringify({ error: 'Failed to fetch SOAP notes', details: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Successfully fetched SOAP notes:', notes?.length || 0);

          return new Response(
            JSON.stringify({ 
              data: notes || [],
              count: count || 0,
              limit,
              offset
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        let noteData: SOAPNoteData;
        
        try {
          const requestText = await req.text();
          console.log('Raw request body:', requestText.slice(0, 200) + '...');
          
          if (!requestText.trim()) {
            return new Response(
              JSON.stringify({ error: 'Empty request body' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          noteData = JSON.parse(requestText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate required fields
        if (!noteData.patient_id || !noteData.provider_name) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: patient_id, provider_name' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Creating SOAP note for patient:', noteData.patient_id);
        const { data: newNote, error: createError } = await supabaseClient
          .from('soap_notes')
          .insert({
            ...noteData,
            provider_id: user.id,
            created_by: user.id,
            last_modified_by: user.id,
            date_of_service: noteData.date_of_service ? new Date(noteData.date_of_service).toISOString() : new Date().toISOString()
          })
          .select(`
            *,
            patients(id, first_name, last_name, email)
          `)
          .single();

        if (createError) {
          console.error('Error creating SOAP note:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create SOAP note', details: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ data: newNote }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        // For PUT requests, check if noteId is in the body (new format) or URL (old format)
        let targetNoteId = noteId;
        let updateData: Partial<SOAPNoteData>;
        
        try {
          const requestText = await req.text();
          console.log('Update request body:', requestText.slice(0, 200) + '...');
          
          if (!requestText.trim()) {
            return new Response(
              JSON.stringify({ error: 'Empty request body' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const parsedData = JSON.parse(requestText);
          
          // Check if noteId is in the body (new format)
          if (parsedData.noteId) {
            targetNoteId = parsedData.noteId;
            const { noteId: _, ...restData } = parsedData;
            updateData = restData;
          } else {
            updateData = parsedData;
          }
        } catch (parseError) {
          console.error('JSON parse error in update:', parseError);
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!targetNoteId || targetNoteId === 'soap-notes') {
          return new Response(
            JSON.stringify({ error: 'Note ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Updating SOAP note:', targetNoteId, 'with data:', updateData);
        const { data: updatedNote, error: updateError } = await supabaseClient
          .from('soap_notes')
          .update({
            ...updateData,
            last_modified_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetNoteId)
          .select(`
            *,
            patients(id, first_name, last_name, email)
          `)
          .single();

        if (updateError) {
          console.error('Error updating SOAP note:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update SOAP note', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ data: updatedNote }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        if (!noteId || noteId === 'soap-notes') {
          return new Response(
            JSON.stringify({ error: 'Note ID required for deletion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabaseClient
          .from('soap_notes')
          .delete()
          .eq('id', noteId);

        if (deleteError) {
          console.error('Error deleting SOAP note:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to delete SOAP note' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'SOAP note deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in soap-notes function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});