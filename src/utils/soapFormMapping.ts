// Enhanced mapping system for connecting form checkboxes to SOAP notes
// This ensures 100% field coverage between all forms and SOAP note sections

// ==================== CURRENT SYMPTOMS MAPPING ====================

export interface CurrentSymptomsMapping {
  formField: string;
  soapFields: string[];
  category: 'head_neck' | 'arms_hands' | 'back_core' | 'legs_feet' | 'neurological' | 'general';
  description: string;
}

export const CURRENT_SYMPTOMS_MAPPING: CurrentSymptomsMapping[] = [
  // Head & Neck
  { formField: 'headache', soapFields: ['headache'], category: 'head_neck', description: 'Headache' },
  { formField: 'neckPain', soapFields: ['neck_pain'], category: 'head_neck', description: 'Neck Pain' },
  { formField: 'jawPain', soapFields: ['jaw_pain'], category: 'head_neck', description: 'Jaw Pain' },
  { formField: 'facialPain', soapFields: ['facial_pain'], category: 'head_neck', description: 'Facial Pain' },
  { formField: 'neckStiffness', soapFields: ['neck_stiffness'], category: 'head_neck', description: 'Neck Stiffness' },

  // Arms & Hands
  { formField: 'armPain', soapFields: ['arm_pain'], category: 'arms_hands', description: 'Arm Pain' },
  { formField: 'shoulderPain', soapFields: ['shoulder_pain'], category: 'arms_hands', description: 'Shoulder Pain' },
  { formField: 'elbowPain', soapFields: ['elbow_pain'], category: 'arms_hands', description: 'Elbow Pain' },
  { formField: 'wristPain', soapFields: ['wrist_pain'], category: 'arms_hands', description: 'Wrist Pain' },
  { formField: 'handPain', soapFields: ['hand_pain'], category: 'arms_hands', description: 'Hand Pain' },
  { formField: 'fingerNumbness', soapFields: ['finger_numbness'], category: 'arms_hands', description: 'Finger Numbness' },
  { formField: 'armWeakness', soapFields: ['arm_weakness'], category: 'arms_hands', description: 'Arm Weakness' },
  { formField: 'tinglingArmsHands', soapFields: ['tingling_arms_hands'], category: 'arms_hands', description: 'Tingling in Arms/Hands' },
  { formField: 'lossStrengthArms', soapFields: ['arm_weakness'], category: 'arms_hands', description: 'Loss of Strength in Arms' },

  // Back & Core
  { formField: 'backPain', soapFields: ['upper_back_pain', 'mid_back_pain', 'lower_back_pain'], category: 'back_core', description: 'Back Pain (All Areas)' },
  { formField: 'upperBackPain', soapFields: ['upper_back_pain'], category: 'back_core', description: 'Upper Back Pain' },
  { formField: 'midBackPain', soapFields: ['mid_back_pain'], category: 'back_core', description: 'Mid Back Pain' },
  { formField: 'lowerBackPain', soapFields: ['lower_back_pain'], category: 'back_core', description: 'Lower Back Pain' },
  { formField: 'backStiffness', soapFields: ['back_stiffness'], category: 'back_core', description: 'Back Stiffness' },
  { formField: 'muscleSpasms', soapFields: ['muscle_spasms'], category: 'back_core', description: 'Muscle Spasms' },
  { formField: 'chestPain', soapFields: ['chest_pain'], category: 'back_core', description: 'Chest Pain' },
  { formField: 'shortnessBreath', soapFields: ['chest_pain'], category: 'back_core', description: 'Shortness of Breath' },

  // Legs & Feet
  { formField: 'hipPain', soapFields: ['hip_pain'], category: 'legs_feet', description: 'Hip Pain' },
  { formField: 'thighPain', soapFields: ['thigh_pain'], category: 'legs_feet', description: 'Thigh Pain' },
  { formField: 'kneePain', soapFields: ['knee_pain'], category: 'legs_feet', description: 'Knee Pain' },
  { formField: 'legPain', soapFields: ['leg_pain'], category: 'legs_feet', description: 'Leg Pain' },
  { formField: 'anklePain', soapFields: ['ankle_pain'], category: 'legs_feet', description: 'Ankle Pain' },
  { formField: 'footPain', soapFields: ['foot_pain'], category: 'legs_feet', description: 'Foot Pain' },
  { formField: 'legWeakness', soapFields: ['leg_weakness'], category: 'legs_feet', description: 'Leg Weakness' },
  { formField: 'legNumbness', soapFields: ['leg_numbness'], category: 'legs_feet', description: 'Leg Numbness' },
  { formField: 'tinglingLegsFeet', soapFields: ['tingling_legs_feet'], category: 'legs_feet', description: 'Tingling in Legs/Feet' },
  { formField: 'lossStrengthLegs', soapFields: ['leg_weakness'], category: 'legs_feet', description: 'Loss of Strength in Legs' },
  { formField: 'numbnessLegsFeet', soapFields: ['leg_numbness', 'tingling_legs_feet'], category: 'legs_feet', description: 'Numbness in Legs/Feet' },

  // Neurological
  { formField: 'dizziness', soapFields: ['dizziness'], category: 'neurological', description: 'Dizziness' },
  { formField: 'visionProblems', soapFields: ['vision_problems'], category: 'neurological', description: 'Vision Problems' },
  { formField: 'hearingProblems', soapFields: ['hearing_problems'], category: 'neurological', description: 'Hearing Problems' },
  { formField: 'memoryProblems', soapFields: ['memory_problems'], category: 'neurological', description: 'Memory Problems' },
  { formField: 'concentrationIssues', soapFields: ['concentration_issues'], category: 'neurological', description: 'Concentration Issues' },
  { formField: 'balanceProblems', soapFields: ['balance_problems'], category: 'neurological', description: 'Balance Problems' },
  { formField: 'lightheadedness', soapFields: ['dizziness'], category: 'neurological', description: 'Lightheadedness' },

  // General
  { formField: 'fatigue', soapFields: ['fatigue'], category: 'general', description: 'Fatigue' },
  { formField: 'sleepProblems', soapFields: ['sleep_problems'], category: 'general', description: 'Sleep Problems' },
  { formField: 'anxiety', soapFields: ['anxiety'], category: 'general', description: 'Anxiety' },
  { formField: 'depression', soapFields: ['depression'], category: 'general', description: 'Depression' },
  { formField: 'nausea', soapFields: ['nausea'], category: 'general', description: 'Nausea' },
  { formField: 'appetiteChanges', soapFields: ['appetite_changes'], category: 'general', description: 'Appetite Changes' },
  { formField: 'irritability', soapFields: ['irritability'], category: 'general', description: 'Irritability' },
  { formField: 'fever', soapFields: ['fatigue'], category: 'general', description: 'Fever' },
  { formField: 'chills', soapFields: ['fatigue'], category: 'general', description: 'Chills' },
];

// ==================== FAMILY HISTORY MAPPING ====================

export interface FamilyHistoryMapping {
  formField: string;
  soapField: string;
  description: string;
}

export const FAMILY_HISTORY_MAPPING: FamilyHistoryMapping[] = [
  { formField: 'heartTrouble', soapField: 'heart_trouble', description: 'Heart Trouble' },
  { formField: 'stroke', soapField: 'stroke', description: 'Stroke' },
  { formField: 'diabetes', soapField: 'diabetes', description: 'Diabetes' },
  { formField: 'cancer', soapField: 'cancer', description: 'Cancer' },
  { formField: 'arthritis', soapField: 'arthritis', description: 'Arthritis' },
  { formField: 'highBloodPressure', soapField: 'high_blood_pressure', description: 'High Blood Pressure' },
  { formField: 'kidneyDisease', soapField: 'kidney_disease', description: 'Kidney Disease' },
  { formField: 'mentalIllness', soapField: 'mental_illness', description: 'Mental Illness' },
  { formField: 'asthma', soapField: 'asthma', description: 'Asthma' },
  { formField: 'epilepsy', soapField: 'epilepsy', description: 'Epilepsy' },
  { formField: 'kyphosis', soapField: 'kyphosis', description: 'Kyphosis' },
  { formField: 'lungDisease', soapField: 'lung_disease', description: 'Lung Disease' },
  { formField: 'osteoporosis', soapField: 'osteoporosis', description: 'Osteoporosis' },
  { formField: 'migraines', soapField: 'migraines', description: 'Migraines' },
  { formField: 'other', soapField: 'other', description: 'Other' },
];

// ==================== FORM TO SOAP CONVERSION FUNCTIONS ====================

/**
 * Converts form current symptoms data to SOAP note format
 */
export const convertCurrentSymptomsToSOAP = (formSymptoms: Record<string, boolean>) => {
  const soapSymptoms: Record<string, boolean> = {};
  let otherSymptoms: string[] = [];

  // Process each form field
  Object.entries(formSymptoms).forEach(([formField, isChecked]) => {
    if (!isChecked) return;

    // Find mapping for this form field
    const mapping = CURRENT_SYMPTOMS_MAPPING.find(m => m.formField === formField);
    
    if (mapping) {
      // Map to SOAP fields
      mapping.soapFields.forEach(soapField => {
        soapSymptoms[soapField] = true;
      });
    } else {
      // Add to "other" symptoms if no direct mapping found
      const readableField = formField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      otherSymptoms.push(readableField);
    }
  });

  return {
    currentSymptoms: soapSymptoms,
    otherSymptoms: otherSymptoms.length > 0 ? otherSymptoms.join(', ') : ''
  };
};

/**
 * Converts form family history data to SOAP note format
 */
export const convertFamilyHistoryToSOAP = (formFamilyHistory: Record<string, boolean>) => {
  const soapFamilyHistory: Record<string, boolean> = {};
  let otherFamilyHistory: string[] = [];

  // Process each form field
  Object.entries(formFamilyHistory).forEach(([formField, isChecked]) => {
    if (!isChecked) return;

    // Find mapping for this form field
    const mapping = FAMILY_HISTORY_MAPPING.find(m => m.formField === formField);
    
    if (mapping) {
      soapFamilyHistory[mapping.soapField] = true;
    } else {
      // Add to "other" family history if no direct mapping found
      const readableField = formField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      otherFamilyHistory.push(readableField);
    }
  });

  return {
    familyHistory: soapFamilyHistory,
    otherFamilyHistory: otherFamilyHistory.length > 0 ? otherFamilyHistory.join(', ') : ''
  };
};

// ==================== SOAP TO FORM CONVERSION FUNCTIONS ====================

/**
 * Converts SOAP current symptoms data to form format (for autofill)
 */
export const convertSOAPToFormSymptoms = (soapSymptoms: Record<string, boolean>) => {
  const formSymptoms: Record<string, boolean> = {};

  // Process each SOAP field and map back to form fields
  Object.entries(soapSymptoms).forEach(([soapField, isChecked]) => {
    if (!isChecked) return;

    // Find mappings that include this SOAP field
    const mappings = CURRENT_SYMPTOMS_MAPPING.filter(m => m.soapFields.includes(soapField));
    
    mappings.forEach(mapping => {
      formSymptoms[mapping.formField] = true;
    });
  });

  return formSymptoms;
};

/**
 * Converts SOAP family history data to form format (for autofill)
 */
export const convertSOAPToFormFamilyHistory = (soapFamilyHistory: Record<string, boolean>) => {
  const formFamilyHistory: Record<string, boolean> = {};

  // Process each SOAP field and map back to form fields
  Object.entries(soapFamilyHistory).forEach(([soapField, isChecked]) => {
    if (!isChecked) return;

    // Find mapping for this SOAP field
    const mapping = FAMILY_HISTORY_MAPPING.find(m => m.soapField === soapField);
    
    if (mapping) {
      formFamilyHistory[mapping.formField] = true;
    }
  });

  return formFamilyHistory;
};

// ==================== PATIENT DATA TO SOAP AUTOFILL ====================

/**
 * Enhanced autofill function for patient data to SOAP notes
 */
export const autofillSOAPFromPatient = (patient: any) => {
  const autofillData: any = {
    currentSymptoms: {},
    familyHistory: {},
    otherSymptoms: '',
    otherFamilyHistory: ''
  };

  // Process current symptoms from patient data
  if (patient.current_symptoms) {
    const converted = convertCurrentSymptomsToSOAP(patient.current_symptoms);
    autofillData.currentSymptoms = converted.currentSymptoms;
    autofillData.otherSymptoms = converted.otherSymptoms;
  }

  // Process family history from patient data
  if (patient.family_medical_history) {
    try {
      // Parse JSON string if it's a string, otherwise use as object
      let familyHistoryData = patient.family_medical_history;
      if (typeof familyHistoryData === 'string') {
        familyHistoryData = JSON.parse(familyHistoryData);
      }
      
      const converted = convertFamilyHistoryToSOAP(familyHistoryData);
      autofillData.familyHistory = converted.familyHistory;
      autofillData.otherFamilyHistory = converted.otherFamilyHistory;
      
      console.log('Successfully autofilled family history from family_medical_history:', familyHistoryData);
    } catch (error) {
      console.error('Error parsing family_medical_history JSON:', error);
      console.log('Raw family_medical_history data:', patient.family_medical_history);
    }
  }

  // Add pain assessment data
  if (patient.pain_severity) {
    autofillData.painScale = patient.pain_severity;
  }

  if (patient.pain_description) {
    autofillData.painDescription = patient.pain_description;
  }

  if (patient.pain_location) {
    autofillData.painLocation = patient.pain_location;
  }

  // Add functional limitations
  if (patient.functional_limitations) {
    autofillData.functionalLimitations = patient.functional_limitations;
  }

  return autofillData;
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates that all form fields have corresponding SOAP mappings
 */
export const validateMappingCoverage = (formFields: string[], mappingArray: any[]) => {
  const mappedFields = mappingArray.map(m => m.formField);
  const unmappedFields = formFields.filter(field => !mappedFields.includes(field));
  
  return {
    coverage: ((mappedFields.length / formFields.length) * 100).toFixed(2),
    unmappedFields
  };
};

/**
 * Get all available form field options for debugging
 */
export const getFormFieldOptions = () => {
  return {
    currentSymptoms: CURRENT_SYMPTOMS_MAPPING.map(m => ({ 
      formField: m.formField, 
      soapFields: m.soapFields,
      category: m.category 
    })),
    familyHistory: FAMILY_HISTORY_MAPPING.map(m => ({ 
      formField: m.formField, 
      soapField: m.soapField 
    }))
  };
};