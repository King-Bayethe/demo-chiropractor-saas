import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get client IP address helper
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP (shouldn't happen in production)
  return '127.0.0.1';
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

    const startTime = Date.now();
    const requestBody = await req.json();
    const { formType, formData, honeypot } = requestBody; // Added honeypot field
    
    // Get client information for security
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    if (!formType || !formData) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Security checks: Honeypot validation
    if (honeypot && honeypot.trim() !== '') {
      console.log('Honeypot field filled, blocking submission from:', clientIP);
      return new Response(JSON.stringify({ error: 'Invalid submission' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Security checks: Rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_form_submission_rate_limit', {
        client_ip: clientIP,
        form_type_param: formType,
        max_submissions: 5, // 5 submissions per hour
        window_minutes: 60
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(JSON.stringify({ error: 'System error during submission' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!rateLimitCheck) {
      console.log('Rate limit exceeded for IP:', clientIP, 'form type:', formType);
      return new Response(JSON.stringify({ 
        error: 'Too many submissions. Please wait before submitting again.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Security checks: Form validation
    const { data: formValidation, error: validationError } = await supabase
      .rpc('validate_form_submission', {
        form_data_param: formData,
        form_type_param: formType,
        honeypot_value: honeypot || null
      });

    if (validationError || !formValidation) {
      console.log('Form validation failed for IP:', clientIP, 'form type:', formType);
      return new Response(JSON.stringify({ error: 'Invalid form data' }), {
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
          // Update existing patient with comprehensive PIP data - Fixed field mappings
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
              emergency_contact_relationship: formData.emergencyRelationship,
              drivers_license: formData.licenseNumber, // Fixed: was driversLicense
              drivers_license_state: formData.licenseState, // Fixed: was driversLicenseState
              social_security_number: formData.ssn,
              marital_status: formData.maritalStatus,
              employment_status: formData.employment, // Fixed: was employmentStatus
              employer_name: formData.employerName,
              employer_address: formData.employerAddress,
              student_status: formData.student, // Fixed: was studentStatus
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
              person_type: formData.personRole, // Fixed: was personType
              weather_conditions: formData.weather, // Fixed: needs mapping
              street_surface: formData.streetSurface,
              body_part_hit: formData.hitCarDetails, // Fixed: was bodyPart
              what_body_hit: formData.whatItHit,
              medical_systems_review: formData.systemReview || {}, // Fixed: was systems
              case_type: formType === 'cash' ? 'Cash Plan' : (formData.caseType || 'PIP'),
              pip_form_submitted_at: new Date().toISOString(),
              consent_acknowledgement: formData.consentAcknowledgement || false,
              patient_signature: formData.patientSignature, // Fixed: was signature
              signature_date: formData.finalDate || null, // Fixed: was date
              last_synced_at: new Date().toISOString(),
              // Enhanced PIP form data with correct field mapping
              pain_description: formData.painDescription || {},
              current_symptoms: formData.currentSymptoms || {},
              pain_location: formData.painLocation,
              family_medical_history: formData.familyHistory || {}, // Fixed: was familyHistory -> JSON string conversion
              systems_review: formData.systemReview || {},
              alcohol_consumption: formData.drinksAlcohol, // Fixed: was alcoholConsumption
              smoking_status: formData.smokes,
              loss_of_consciousness: formData.lossOfConsciousness,
              consciousness_duration: formData.consciousnessLength, // Fixed: was consciousnessDuration
              previous_accidents: formData.previousAccidents,
              allergies: formData.allergies,
              alternative_communication: formData.alternativeCommunication,
              email_consent: formData.emailConsent,
              release_information: {
                releasePersonOrganization: formData.releasePersonOrganization,
                releaseAddress: formData.releaseAddress,
                releasePhone: formData.releasePhone,
                releaseReason: formData.releaseReason,
                healthcareFacility: formData.healthcareFacility,
                healthcareFacilityAddress: formData.healthcareFacilityAddress,
                healthcareFacilityPhone: formData.healthcareFacilityPhone,
                treatmentDates: formData.treatmentDates,
              },
              accident_impact_details: {
                vehicleOwner: formData.vehicleOwner,
                relationshipToOwner: formData.relationshipToOwner,
                vehicleDriver: formData.vehicleDriver,
                relationshipToDriver: formData.relationshipToDriver,
                householdMembers: formData.householdMembers,
                ownedVehicles: formData.ownedVehicles,
                accidentLocation: formData.accidentLocation,
                accidentCity: formData.accidentCity,
                vehicleMotion: formData.vehicleMotion,
                headPosition: formData.headPosition,
                thrownDirection: formData.thrownDirection,
                sawImpact: formData.sawImpact,
                braceForImpact: formData.braceForImpact,
                hitCar: formData.hitCar,
              },
              emergency_hospital_visit: formData.wentToHospital === 'yes', // Fixed: was emergencyHospitalVisit
              hospital_name: formData.hospitalName, // Fixed: was emergency_hospital_details
            })
            .eq('id', existingPatient.id)
            .select('id')
            .single();

          if (!updateError) {
            patientId = updatedPatient.id;
          }
        } else {
          // Create new patient with comprehensive PIP data - Fixed field mappings
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
              emergency_contact_relationship: formData.emergencyRelationship,
              drivers_license: formData.licenseNumber, // Fixed: was driversLicense
              drivers_license_state: formData.licenseState, // Fixed: was driversLicenseState
              social_security_number: formData.ssn,
              marital_status: formData.maritalStatus,
              employment_status: formData.employment, // Fixed: was employmentStatus
              employer_name: formData.employerName,
              employer_address: formData.employerAddress,
              student_status: formData.student, // Fixed: was studentStatus
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
              person_type: formData.personRole, // Fixed: was personType
              weather_conditions: formData.weather,
              street_surface: formData.streetSurface,
              body_part_hit: formData.hitCarDetails, // Fixed: was bodyPart
              what_body_hit: formData.whatItHit,
              medical_systems_review: formData.systemReview || {}, // Fixed: was systems
              pip_form_submitted_at: new Date().toISOString(),
              consent_acknowledgement: formData.consentAcknowledgement || false,
              patient_signature: formData.patientSignature, // Fixed: was signature
              signature_date: formData.finalDate || null, // Fixed: was date
              case_type: formType === 'cash' ? 'Cash Plan' : (formData.caseType || 'PIP'),
              tags: formType === 'cash' ? ['patient', 'cash'] : ['patient', 'pip'],
              // Enhanced PIP form data with correct field mapping
              pain_description: formData.painDescription || {},
              current_symptoms: formData.currentSymptoms || {},
              pain_location: formData.painLocation,
              family_medical_history: formData.familyHistory || {},
              systems_review: formData.systemReview || {},
              alcohol_consumption: formData.drinksAlcohol, // Fixed: was alcoholConsumption
              smoking_status: formData.smokes,
              loss_of_consciousness: formData.lossOfConsciousness,
              consciousness_duration: formData.consciousnessLength, // Fixed: was consciousnessDuration
              previous_accidents: formData.previousAccidents,
              allergies: formData.allergies,
              alternative_communication: formData.alternativeCommunication,
              email_consent: formData.emailConsent,
              release_information: {
                releasePersonOrganization: formData.releasePersonOrganization,
                releaseAddress: formData.releaseAddress,
                releasePhone: formData.releasePhone,
                releaseReason: formData.releaseReason,
                healthcareFacility: formData.healthcareFacility,
                healthcareFacilityAddress: formData.healthcareFacilityAddress,
                healthcareFacilityPhone: formData.healthcareFacilityPhone,
                treatmentDates: formData.treatmentDates,
              },
              accident_impact_details: {
                vehicleOwner: formData.vehicleOwner,
                relationshipToOwner: formData.relationshipToOwner,
                vehicleDriver: formData.vehicleDriver,
                relationshipToDriver: formData.relationshipToDriver,
                householdMembers: formData.householdMembers,
                ownedVehicles: formData.ownedVehicles,
                accidentLocation: formData.accidentLocation,
                accidentCity: formData.accidentCity,
                vehicleMotion: formData.vehicleMotion,
                headPosition: formData.headPosition,
                thrownDirection: formData.thrownDirection,
                sawImpact: formData.sawImpact,
                braceForImpact: formData.braceForImpact,
                hitCar: formData.hitCar,
              },
              emergency_hospital_visit: formData.wentToHospital === 'yes', // Fixed: was emergencyHospitalVisit
              hospital_name: formData.hospitalName, // Fixed: was emergency_hospital_details
              
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

    const submissionTime = Date.now() - startTime;

    // Insert form submission with security data
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        form_type: formType,
        form_data: formData,
        patient_id: patientId,
        patient_name: patientName || null,
        patient_email: patientEmail || null,
        patient_phone: patientPhone || null,
        status: 'pending',
        // Security fields
        ip_address: clientIP,
        user_agent: userAgent,
        submission_source: 'web',
        honeypot_field: honeypot || null,
        submission_time_ms: submissionTime
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

    console.log('Form submission created:', data.id, 'from IP:', clientIP)

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