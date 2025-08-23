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

    // Extract patient information and handle different form types
    let patientName = ''
    let patientEmail = ''
    let patientPhone = ''
    let patientId = null;

    if (formType === 'pip' || formType === 'cash') {
      // Handle comprehensive form data for both PIP and Cash forms
      if (formData.firstName && formData.lastName) {
        patientName = `${formData.firstName} ${formData.lastName}`.trim()
      }
      
      if (formData.email) {
        patientEmail = formData.email
      }
      
      if (formData.cellPhone) {
        patientPhone = formData.cellPhone
      }

      try {
        // Try to find existing patient by email or any phone number
        let existingPatient = null;
        
        if (patientEmail || formData.cellPhone || formData.homePhone || formData.workPhone) {
          const { data } = await supabase
            .from('patients')
            .select('*')
            .or(`email.eq.${patientEmail || ''},cell_phone.eq.${formData.cellPhone || ''},home_phone.eq.${formData.homePhone || ''},work_phone.eq.${formData.workPhone || ''},phone.eq.${patientPhone || ''}`)
            .maybeSingle();

          existingPatient = data;
        }

        if (existingPatient) {
          // Update existing patient with comprehensive PIP data
          const { data: updatedPatient, error: updateError } = await supabase
            .from('patients')
            .update({
              first_name: formData.firstName || existingPatient.first_name,
              last_name: formData.lastName || existingPatient.last_name,
              email: patientEmail || existingPatient.email,
              cell_phone: formData.cellPhone,
              home_phone: formData.homePhone,
              work_phone: formData.workPhone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zip,
              date_of_birth: formData.dob || null,
              gender: formData.sex,
              age: formData.age ? parseInt(formData.age) : null,
              emergency_contact_name: formData.emergencyContact,
              emergency_contact_phone: formData.emergencyPhone,
              drivers_license: formData.driversLicense,
              drivers_license_state: formData.driversLicenseState,
              social_security_number: formData.ssn,
              marital_status: formData.maritalStatus,
              employment_status: formData.employmentStatus,
              employer_name: formData.employerName,
              employer_address: formData.employerAddress,
              student_status: formData.studentStatus,
              auto_insurance_company: formData.autoInsuranceCo,
              auto_policy_number: formData.policyNumber,
              claim_number: formData.claimNumber,
              adjuster_name: formData.adjusterName,
              health_insurance: formData.healthInsurance,
              group_number: formData.groupNumber,
              attorney_name: formData.attorneyName,
              attorney_phone: formData.attorneyPhone,
              accident_date: formData.accidentDate || null,
              accident_time: formData.accidentTime || null,
              accident_description: formData.accidentDescription,
              person_type: formData.personType,
              weather_conditions: formData.weather,
              street_surface: formData.streetSurface,
              body_part_hit: formData.bodyPart,
              what_body_hit: formData.whatItHit,
              medical_systems_review: formData.systems || {},
              case_type: formType === 'cash' ? 'Cash Plan' : (formData.caseType || 'PIP'),
              pip_form_submitted_at: new Date().toISOString(),
              consent_acknowledgement: formData.consentAcknowledgement || false,
              patient_signature: formData.signature,
              signature_date: formData.date || null,
              last_synced_at: new Date().toISOString(),
              // Enhanced PIP form data
              pain_description: formData.painDescription || {},
              current_symptoms: formData.currentSymptoms || {},
              family_medical_history: formData.familyHistory || {},
              systems_review: formData.systemsReview || {},
              alcohol_consumption: formData.alcoholConsumption,
              loss_of_consciousness: formData.lossOfConsciousness,
              consciousness_duration: formData.consciousnessDuration,
              previous_accidents: formData.previousAccidents,
              alternative_communication: formData.alternativeCommunication,
              email_consent: formData.emailConsent,
              release_information: formData.releaseInformation || {},
              accident_impact_details: formData.accidentImpactDetails || {},
              emergency_hospital_visit: formData.emergencyHospitalVisit || false,
              emergency_hospital_details: formData.emergencyHospitalDetails,
              pain_frequency: formData.painFrequency,
              pain_quality: formData.painQuality,
              symptom_changes: formData.symptomChanges,
              functional_limitations: formData.functionalLimitations,
            })
            .eq('id', existingPatient.id)
            .select('id')
            .single();

          if (!updateError) {
            patientId = updatedPatient.id;
          }
        } else {
          // Create new patient with comprehensive PIP data
          const { data: newPatient, error: createError } = await supabase
            .from('patients')
            .insert({
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: patientEmail,
              cell_phone: formData.cellPhone,
              home_phone: formData.homePhone,
              work_phone: formData.workPhone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zip,
              date_of_birth: formData.dob || null,
              gender: formData.sex,
              age: formData.age ? parseInt(formData.age) : null,
              emergency_contact_name: formData.emergencyContact,
              emergency_contact_phone: formData.emergencyPhone,
              drivers_license: formData.driversLicense,
              drivers_license_state: formData.driversLicenseState,
              social_security_number: formData.ssn,
              marital_status: formData.maritalStatus,
              employment_status: formData.employmentStatus,
              employer_name: formData.employerName,
              employer_address: formData.employerAddress,
              student_status: formData.studentStatus,
              auto_insurance_company: formData.autoInsuranceCo,
              auto_policy_number: formData.policyNumber,
              claim_number: formData.claimNumber,
              adjuster_name: formData.adjusterName,
              health_insurance: formData.healthInsurance,
              group_number: formData.groupNumber,
              attorney_name: formData.attorneyName,
              attorney_phone: formData.attorneyPhone,
              accident_date: formData.accidentDate || null,
              accident_time: formData.accidentTime || null,
              accident_description: formData.accidentDescription,
              person_type: formData.personType,
              weather_conditions: formData.weather,
              street_surface: formData.streetSurface,
              body_part_hit: formData.bodyPart,
              what_body_hit: formData.whatItHit,
              medical_systems_review: formData.systems || {},
              pip_form_submitted_at: new Date().toISOString(),
              consent_acknowledgement: formData.consentAcknowledgement || false,
              patient_signature: formData.signature,
              signature_date: formData.date || null,
              case_type: formType === 'cash' ? 'Cash Plan' : (formData.caseType || 'PIP'),
              tags: formType === 'cash' ? ['patient', 'cash'] : ['patient', 'pip'],
              // Enhanced PIP form data
              pain_description: formData.painDescription || {},
              current_symptoms: formData.currentSymptoms || {},
              family_medical_history: formData.familyHistory || {},
              systems_review: formData.systemsReview || {},
              alcohol_consumption: formData.alcoholConsumption,
              loss_of_consciousness: formData.lossOfConsciousness,
              consciousness_duration: formData.consciousnessDuration,
              previous_accidents: formData.previousAccidents,
              alternative_communication: formData.alternativeCommunication,
              email_consent: formData.emailConsent,
              release_information: formData.releaseInformation || {},
              accident_impact_details: formData.accidentImpactDetails || {},
              emergency_hospital_visit: formData.emergencyHospitalVisit || false,
              emergency_hospital_details: formData.emergencyHospitalDetails,
              pain_frequency: formData.painFrequency,
              pain_quality: formData.painQuality,
              symptom_changes: formData.symptomChanges,
              functional_limitations: formData.functionalLimitations,
              
              is_active: true,
            })
            .select('id')
            .single();

          if (!createError) {
            patientId = newPatient.id;
          }
        }
      } catch (error) {
        console.warn('Error handling PIP patient data:', error);
      }
    } else {
      // Handle other form types (existing logic)
      if (formData.patient_name) {
        patientName = formData.patient_name
      }
      
      if (formData.patient_email) {
        patientEmail = formData.patient_email
      }
      
      if (formData.patient_phone) {
        patientPhone = formData.patient_phone
      }

      try {
        // Try to find existing patient by email or phone
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .or(`email.eq.${patientEmail || ''},phone.eq.${patientPhone || ''}`)
          .maybeSingle();

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