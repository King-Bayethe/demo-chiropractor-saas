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
    
    // Enhanced mapping for current symptoms from all form types
    let currentSymptoms = {}
    let painDescription = {}
    let systemsReview = {}
    
    // Handle PIP form current symptoms
    if (formData.currentSymptoms) {
      currentSymptoms = {
        // Map PIP form field names to patient schema names
        headache: formData.currentSymptoms.headache,
        neck_pain: formData.currentSymptoms.neckPain,
        neck_stiffness: formData.currentSymptoms.neckStiff,
        lower_back_pain: formData.currentSymptoms.backPain,
        pain_arms_hands: formData.currentSymptoms.painArmsHands,
        pain_legs_feet: formData.currentSymptoms.painLegsFeet,
        loss_strength_arms: formData.currentSymptoms.lossStrengthArms,
        loss_strength_legs: formData.currentSymptoms.lossStrengthLegs,
        numbness_arms_hands: formData.currentSymptoms.numbnessArmsHands,
        numbness_legs_feet: formData.currentSymptoms.numbnessLegsFeet,
        tingling_arms_hands: formData.currentSymptoms.tinglingArmsHands,
        tingling_legs_feet: formData.currentSymptoms.tinglingLegsFeet,
        dizziness: formData.currentSymptoms.dizziness,
        fatigue: formData.currentSymptoms.fatigue,
        irritability: formData.currentSymptoms.irritability,
        
        // Additional symptoms from system review if available
        chest_pain_rib: formData.systemReview?.chestPains === 'Yes',
        nausea: formData.systemReview?.nausea === 'Yes',
        anxiety: formData.systemReview?.anxiety === 'Yes',
        depression: formData.systemReview?.depression === 'Yes',
        loss_memory: formData.systemReview?.memoryLoss === 'Yes',
        loss_balance: formData.systemReview?.dizziness === 'Yes',
        sleeping_problems: formData.systemReview?.fatigue === 'Yes',
        vision_problems: formData.systemReview?.blurredVision === 'Yes' || formData.systemReview?.doubleVision === 'Yes',
        hearing_problems: formData.systemReview?.ringingEars === 'Yes' || formData.systemReview?.decreasedHearing === 'Yes',
        shortness_breath: formData.systemReview?.difficultyBreathing === 'Yes',
        loss_smell: false // Not captured in current forms
      }
    }
    
    // Handle pain description from PIP form
    if (formData.painDescription) {
      painDescription = {
        description: Object.entries(formData.painDescription)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key)
          .join(', '),
        details: formData.painDescription
      }
    }
    
    // Handle systems review data
    if (formData.systemReview) {
      systemsReview = formData.systemReview
    }
    
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
      emergency_contact_relationship: formData.emergencyContactRelationship,
      
      // Enhanced medical data storage
      medical_systems_review: systemsReview,
      current_symptoms: currentSymptoms,
      pain_description: painDescription,
      systems_review: formData.systemReview || {},
      
      // Medical history fields
      current_medications: formData.currentMedications || null,
      allergies: formData.allergies || null,
      past_injuries: formData.pastInjuries || null,
      previous_accidents: formData.previousAccidents || null,
      chronic_conditions: formData.chronicConditions || null,
      other_medical_history: formData.otherMedicalHistory || null,
      pain_location: formData.painLocation || null,
      pain_severity: formData.painSeverity ? parseInt(formData.painSeverity) : null,
      family_medical_history: formData.familyMedicalHistory || null,
      smoking_status: formData.smokingStatus || null,
      smoking_history: formData.smokingHistory || null,
      
      // Form metadata
      patient_signature: formData.signature,
      consent_acknowledgement: formData.consentAcknowledgement || false,
      case_type: submission.form_type === 'pip' ? 'PIP' : submission.form_type === 'lop' ? 'Attorney Only' : 'Cash Plan',
      tags: [submission.form_type, 'patient'],
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
      // Update existing patient - merge symptom data properly
      const mergedCurrentSymptoms = {
        ...existingPatient.current_symptoms,
        ...currentSymptoms
      }
      
      const mergedPainDescription = {
        ...existingPatient.pain_description,
        ...painDescription
      }
      
      const mergedSystemsReview = {
        ...existingPatient.systems_review,
        ...systemsReview
      }
      
      const updateData = {
        ...patientData,
        // Merge symptom and medical data
        current_symptoms: mergedCurrentSymptoms,
        pain_description: mergedPainDescription,
        systems_review: mergedSystemsReview,
        
        // Preserve existing data for fields that are not provided
        current_medications: formData.currentMedications || existingPatient.current_medications,
        allergies: formData.allergies || existingPatient.allergies,
        past_injuries: formData.pastInjuries || existingPatient.past_injuries,
        previous_accidents: formData.previousAccidents || existingPatient.previous_accidents,
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