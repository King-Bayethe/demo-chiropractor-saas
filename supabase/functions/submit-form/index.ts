import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { formType, formData } = await req.json()

    if (!formType || !formData) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract patient information based on form type
    let patientName = ''
    let patientEmail = ''
    let patientPhone = ''

    if (formData.firstName && formData.lastName) {
      patientName = `${formData.firstName} ${formData.lastName}`.trim()
    }
    
    if (formData.email) {
      patientEmail = formData.email
    }
    
    if (formData.cellPhone) {
      patientPhone = formData.cellPhone
    }

    // Find or create patient record
    let patientId = null;
    
    try {
      // Try to find existing patient by email or phone
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .or(`email.eq.${patientEmail || ''},phone.eq.${patientPhone || ''}`)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else if (patientName || patientEmail || patientPhone) {
        // Create new patient if not found
        const nameParts = patientName?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: patientEmail || null,
            phone: patientPhone || null,
          })
          .select('id')
          .single();

        if (patientError) {
          console.warn('Could not create patient record:', patientError);
        } else {
          patientId = newPatient.id;
        }
      }
    } catch (patientLookupError) {
      console.warn('Could not find/create patient record:', patientLookupError);
    }

    // Insert form submission
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        form_type: formType,
        form_data: formData,
        patient_id: patientId,
        patient_name: patientName || null,
        patient_email: patientEmail || null,
        patient_phone: patientPhone || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting form submission:', error)
      return new Response(JSON.stringify({ error: 'Failed to submit form' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Form submission created:', data)

    return new Response(JSON.stringify({ 
      success: true, 
      submissionId: data.id,
      message: 'Form submitted successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})