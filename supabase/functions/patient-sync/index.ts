import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');
const GHL_LOCATION_ID = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Patient Sync Function Called ===');
    
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      throw new Error('GHL API credentials not configured');
    }

    const { action = 'syncAll', ghlContactId } = await req.json().catch(() => ({}));

    if (action === 'syncSingle' && ghlContactId) {
      // Sync a single contact
      const contact = await fetchGHLContact(ghlContactId);
      if (contact) {
        const patient = await syncContactToPatient(contact);
        return new Response(JSON.stringify({ success: true, patient }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } else if (action === 'syncAll') {
      // Sync all contacts with patient tags
      const contacts = await fetchPatientContacts();
      const syncResults = [];
      
      for (const contact of contacts) {
        try {
          const patient = await syncContactToPatient(contact);
          syncResults.push({ success: true, ghlContactId: contact.id, patientId: patient.id });
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
          syncResults.push({ success: false, ghlContactId: contact.id, error: error.message });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        syncedCount: syncResults.filter(r => r.success).length,
        failedCount: syncResults.filter(r => !r.success).length,
        results: syncResults 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in patient-sync function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function fetchGHLContact(contactId: string) {
  const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GHL contact: ${response.status}`);
  }

  return await response.json();
}

async function fetchPatientContacts() {
  const response = await fetch(`${GHL_API_BASE}/contacts/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      filters: [
        {
          field: "tags",
          operator: "contains_set",
          value: ["patient", "treatment"]
        }
      ],
      pageLimit: 100
    }),
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error(`GHL API Error (fetchPatientContacts): ${response.status}`, errorResponse);
    throw new Error(`Failed to fetch patient contacts from GHL: Status ${response.status}. Response: ${errorResponse}`);
  }

  const data = await response.json();
  return data.contacts || [];
}

async function syncContactToPatient(ghlContact: any) {
  const patientData = {
    ghl_contact_id: ghlContact.id,
    first_name: ghlContact.firstName || null,
    last_name: ghlContact.lastName || null,
    email: ghlContact.email || null,
    phone: ghlContact.phone || null,
    date_of_birth: ghlContact.dateOfBirth || null,
    gender: ghlContact.customFields?.find((f: any) => f.key === 'gender')?.value || null,
    address: ghlContact.address1 || null,
    city: ghlContact.city || null,
    state: ghlContact.state || null,
    zip_code: ghlContact.postalCode || null,
    tags: ghlContact.tags || [],
    last_synced_at: new Date().toISOString(),
  };

  // Check if patient already exists
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('ghl_contact_id', ghlContact.id)
    .single();

  if (existingPatient) {
    // Update existing patient
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('ghl_contact_id', ghlContact.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new patient
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

serve(handler);