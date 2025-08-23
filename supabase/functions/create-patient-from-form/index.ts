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

    const { formSubmissionId } = await req.json()

    if (!formSubmissionId) {
      return new Response(JSON.stringify({ error: 'Missing form submission ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the form submission
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', formSubmissionId)
      .single()

    if (submissionError || !submission) {
      return new Response(JSON.stringify({ error: 'Form submission not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const formData = submission.form_data as any
    
    // Create patient from form data
    const patientData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      cell_phone: formData.cellPhone,
      home_phone: formData.homePhone || null,
      work_phone: formData.workPhone || null,
      phone: formData.cellPhone, // Primary phone
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip,
      date_of_birth: formData.dob || null,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.sex,
      social_security_number: formData.ssn,
      drivers_license: formData.driversLicense,
      drivers_license_state: formData.driversLicenseState,
      marital_status: formData.maritalStatus,
      employment_status: formData.employmentStatus,
      employer_name: formData.employerName,
      employer_address: formData.employerAddress,
      student_status: formData.studentStatus,
      emergency_contact_name: formData.emergencyContact,
      emergency_contact_phone: formData.emergencyPhone,
      medical_systems_review: formData.systems || {},
      current_medications: formData.currentMedications || null,
      allergies: formData.allergies || null,
      past_injuries: formData.pastInjuries || null,
      previous_surgeries: formData.previousSurgeries || null,
      chronic_conditions: formData.chronicConditions || null,
      other_medical_history: formData.otherMedicalHistory || null,
      pain_location: formData.painLocation || null,
      pain_severity: formData.painSeverity ? parseInt(formData.painSeverity) : null,
      family_medical_history: formData.familyMedicalHistory || null,
      smoking_status: formData.smokingStatus || null,
      smoking_history: formData.smokingHistory || null,
      patient_signature: formData.signature,
      consent_acknowledgement: formData.consentAcknowledgement || false,
      case_type: 'Cash Plan',
      tags: ['patient', 'cash'],
      is_active: true,
    }

    // Check if patient already exists
    let existingPatient = null
    if (formData.email || formData.cellPhone) {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .or(`email.eq.${formData.email || ''},cell_phone.eq.${formData.cellPhone || ''}`)
        .maybeSingle()

      existingPatient = data
    }

    let patientId = null

    if (existingPatient) {
      // Update existing patient
      const updateData = {
        ...patientData,
        // Preserve existing data for fields that are not provided
        current_medications: formData.currentMedications || existingPatient.current_medications,
        allergies: formData.allergies || existingPatient.allergies,
        past_injuries: formData.pastInjuries || existingPatient.past_injuries,
        previous_surgeries: formData.previousSurgeries || existingPatient.previous_surgeries,
        chronic_conditions: formData.chronicConditions || existingPatient.chronic_conditions,
        other_medical_history: formData.otherMedicalHistory || existingPatient.other_medical_history,
        pain_location: formData.painLocation || existingPatient.pain_location,
        pain_severity: formData.painSeverity ? parseInt(formData.painSeverity) : existingPatient.pain_severity,
        family_medical_history: formData.familyMedicalHistory || existingPatient.family_medical_history,
        smoking_status: formData.smokingStatus || existingPatient.smoking_status,
        smoking_history: formData.smokingHistory || existingPatient.smoking_history,
      };

      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', existingPatient.id)
        .select('id, first_name, last_name')
        .single()

      if (updateError) {
        console.error('Error updating patient:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update patient' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      patientId = updatedPatient.id
      console.log('Updated existing patient:', updatedPatient)
    } else {
      // Create new patient
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert(patientData)
        .select('id, first_name, last_name')
        .single()

      if (createError) {
        console.error('Error creating patient:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create patient' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      patientId = newPatient.id
      console.log('Created new patient:', newPatient)
    }

    // Update form submission with patient info
    const { error: updateSubmissionError } = await supabase
      .from('form_submissions')
      .update({
        patient_id: patientId,
        patient_name: `${formData.firstName} ${formData.lastName}`,
        patient_email: formData.email,
        patient_phone: formData.cellPhone,
        status: 'processed'
      })
      .eq('id', formSubmissionId)

    if (updateSubmissionError) {
      console.warn('Could not update form submission:', updateSubmissionError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      patientId,
      message: 'Patient created successfully from cash form' 
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