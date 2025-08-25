-- Fix the type mismatch in create_patient_from_form_submission function
CREATE OR REPLACE FUNCTION public.create_patient_from_form_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  patient_id_var UUID;
  form_data_parsed JSONB;
  first_name_val TEXT;
  last_name_val TEXT;
  email_val TEXT;
  phone_val TEXT;
BEGIN
  -- Parse form data
  form_data_parsed := NEW.form_data;
  
  -- Extract patient information with fallback to legacy format
  first_name_val := COALESCE(
    form_data_parsed->>'firstName',
    split_part(NEW.patient_name, ' ', 1)
  );
  
  last_name_val := COALESCE(
    form_data_parsed->>'lastName',
    CASE 
      WHEN NEW.patient_name LIKE '% %' THEN
        substr(NEW.patient_name, position(' ' in NEW.patient_name) + 1)
      ELSE ''
    END
  );
  
  email_val := COALESCE(
    form_data_parsed->>'email',
    NEW.patient_email
  );
  
  phone_val := COALESCE(
    form_data_parsed->>'cellPhone',
    form_data_parsed->>'homePhone',
    form_data_parsed->>'phone',
    NEW.patient_phone
  );

  -- Check if patient already exists (by email or phone)
  SELECT id INTO patient_id_var
  FROM public.patients
  WHERE (email = email_val AND email IS NOT NULL)
     OR (phone = phone_val AND phone IS NOT NULL)
  LIMIT 1;

  IF patient_id_var IS NOT NULL THEN
    -- Update existing patient with form data
    UPDATE public.patients
    SET
      first_name = COALESCE(first_name_val, first_name),
      last_name = COALESCE(last_name_val, last_name),
      email = COALESCE(email_val, email),
      phone = COALESCE(phone_val, phone),
      cell_phone = COALESCE(form_data_parsed->>'cellPhone', cell_phone),
      home_phone = COALESCE(form_data_parsed->>'homePhone', home_phone),
      work_phone = COALESCE(form_data_parsed->>'workPhone', work_phone),
      address = COALESCE(form_data_parsed->>'streetAddress', address),
      city = COALESCE(form_data_parsed->>'city', city),
      state = COALESCE(form_data_parsed->>'state', state),
      zip_code = COALESCE(form_data_parsed->>'zipCode', zip_code),
      date_of_birth = COALESCE(
        CASE 
          WHEN form_data_parsed->>'dateOfBirth' IS NOT NULL 
          THEN (form_data_parsed->>'dateOfBirth')::date
          ELSE NULL
        END, 
        date_of_birth
      ),
      gender = COALESCE(form_data_parsed->>'gender', gender),
      marital_status = COALESCE(form_data_parsed->>'maritalStatus', marital_status),
      case_type = COALESCE(
        CASE NEW.form_type
          WHEN 'pip' THEN 'PIP'
          WHEN 'lop' THEN 'Attorney Only'
          ELSE 'Cash Plan'
        END,
        case_type
      ),
      -- Medical information - Fix the JSONB to text conversion
      current_symptoms = COALESCE(
        CASE 
          WHEN form_data_parsed->'currentSymptoms' IS NOT NULL 
          THEN form_data_parsed->'currentSymptoms'
          ELSE NULL
        END,
        current_symptoms
      ),
      family_medical_history = COALESCE(
        CASE 
          WHEN form_data_parsed->'familyHistory' IS NOT NULL 
          THEN (form_data_parsed->'familyHistory')::text
          ELSE NULL
        END,
        family_medical_history
      ),
      pain_severity = COALESCE(
        CASE 
          WHEN form_data_parsed->>'painSeverity' IS NOT NULL 
          THEN (form_data_parsed->>'painSeverity')::integer
          ELSE NULL
        END,
        pain_severity
      ),
      pain_location = COALESCE(form_data_parsed->>'painLocation', pain_location),
      -- Accident details for PIP cases
      accident_date = COALESCE(
        CASE 
          WHEN form_data_parsed->>'accidentDate' IS NOT NULL 
          THEN (form_data_parsed->>'accidentDate')::date
          ELSE NULL
        END,
        accident_date
      ),
      -- Insurance information
      auto_insurance_company = COALESCE(form_data_parsed->>'autoInsuranceCompany', auto_insurance_company),
      auto_policy_number = COALESCE(form_data_parsed->>'policyNumber', auto_policy_number),
      claim_number = COALESCE(form_data_parsed->>'claimNumber', claim_number),
      health_insurance = COALESCE(form_data_parsed->>'healthInsurance', health_insurance),
      -- Attorney information for LOP cases
      attorney_name = COALESCE(form_data_parsed->>'attorneyName', attorney_name),
      attorney_phone = COALESCE(form_data_parsed->>'attorneyPhone', attorney_phone),
      -- Emergency contact
      emergency_contact_name = COALESCE(form_data_parsed->>'emergencyContactName', emergency_contact_name),
      emergency_contact_phone = COALESCE(form_data_parsed->>'emergencyContactPhone', emergency_contact_phone),
      emergency_contact_relationship = COALESCE(form_data_parsed->>'emergencyContactRelationship', emergency_contact_relationship),
      updated_at = now()
    WHERE id = patient_id_var;
    
    -- Update the form submission with the existing patient_id
    UPDATE public.form_submissions
    SET patient_id = patient_id_var
    WHERE id = NEW.id;
    
  ELSE
    -- Create new patient
    INSERT INTO public.patients (
      first_name,
      last_name,
      email,
      phone,
      cell_phone,
      home_phone,
      work_phone,
      address,
      city,
      state,
      zip_code,
      date_of_birth,
      gender,
      marital_status,
      case_type,
      current_symptoms,
      family_medical_history,
      pain_severity,
      pain_location,
      accident_date,
      auto_insurance_company,
      auto_policy_number,
      claim_number,
      health_insurance,
      attorney_name,
      attorney_phone,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      tags
    ) VALUES (
      first_name_val,
      last_name_val,
      email_val,
      phone_val,
      form_data_parsed->>'cellPhone',
      form_data_parsed->>'homePhone',
      form_data_parsed->>'workPhone',
      form_data_parsed->>'streetAddress',
      form_data_parsed->>'city',
      form_data_parsed->>'state',
      form_data_parsed->>'zipCode',
      CASE 
        WHEN form_data_parsed->>'dateOfBirth' IS NOT NULL 
        THEN (form_data_parsed->>'dateOfBirth')::date
        ELSE NULL
      END,
      form_data_parsed->>'gender',
      form_data_parsed->>'maritalStatus',
      CASE NEW.form_type
        WHEN 'pip' THEN 'PIP'
        WHEN 'lop' THEN 'Attorney Only'
        ELSE 'Cash Plan'
      END,
      CASE 
        WHEN form_data_parsed->'currentSymptoms' IS NOT NULL 
        THEN form_data_parsed->'currentSymptoms'
        ELSE NULL
      END,
      CASE 
        WHEN form_data_parsed->'familyHistory' IS NOT NULL 
        THEN (form_data_parsed->'familyHistory')::text
        ELSE NULL
      END,
      CASE 
        WHEN form_data_parsed->>'painSeverity' IS NOT NULL 
        THEN (form_data_parsed->>'painSeverity')::integer
        ELSE NULL
      END,
      form_data_parsed->>'painLocation',
      CASE 
        WHEN form_data_parsed->>'accidentDate' IS NOT NULL 
        THEN (form_data_parsed->>'accidentDate')::date
        ELSE NULL
      END,
      form_data_parsed->>'autoInsuranceCompany',
      form_data_parsed->>'policyNumber',
      form_data_parsed->>'claimNumber',
      form_data_parsed->>'healthInsurance',
      form_data_parsed->>'attorneyName',
      form_data_parsed->>'attorneyPhone',
      form_data_parsed->>'emergencyContactName',
      form_data_parsed->>'emergencyContactPhone',
      form_data_parsed->>'emergencyContactRelationship',
      ARRAY['form-submission', NEW.form_type]
    ) RETURNING id INTO patient_id_var;
    
    -- Update the form submission with the new patient_id
    UPDATE public.form_submissions
    SET patient_id = patient_id_var
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;