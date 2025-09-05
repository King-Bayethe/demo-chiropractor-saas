import { supabase } from "@/integrations/supabase/client";

// Mock PIP Form Data - Generate unique test data to avoid duplicates
const timestamp = Date.now();
const mockPIPFormData = {
  // General Information
  lastName: `Rodriguez-${timestamp}`,
  firstName: "Maria",
  address: "123 Medical Center Blvd",
  city: "Miami",
  state: "FL",
  zip: "33101",
  homePhone: "305-555-0123",
  workPhone: "305-555-0456",
  cellPhone: "305-555-0789",
  email: `maria.rodriguez.${timestamp}@email.com`,
  licenseNumber: "R123456789",
  licenseState: "FL",
  dob: "1985-03-15",
  ssn: "***-**-1234",
  sex: "female",
  maritalStatus: "married",
  emergencyContact: "Carlos Rodriguez",
  emergencyPhone: "305-555-0999",
  employment: "employed",
  student: "no",
  
  // Accident Information
  accidentDate: "2024-12-15",
  accidentTime: "14:30",
  accidentDescription: "Rear-ended while stopped at traffic light on US-1. Other driver failed to brake in time due to distracted driving.",
  accidentLocation: "US-1 and SW 8th Street intersection",
  accidentCity: "Miami",
  personRole: "driver",
  vehicleMotion: "stopped",
  headPosition: "forward",
  thrownDirection: "backward",
  sawImpact: "yes",
  braceForImpact: "yes",
  hitCar: "yes",
  hitCarDetails: "lower back against seat",
  wentToHospital: "yes",
  hospitalName: "Jackson Memorial Hospital",
  lossOfConsciousness: "no",
  consciousnessLength: "0",
  
  // Vehicle & Insurance
  vehicleOwner: "Maria Rodriguez",
  relationshipToOwner: "self",
  vehicleDriver: "Maria Rodriguez",
  relationshipToDriver: "self",
  householdMembers: "2",
  ownedVehicles: "1",
  
  // Medical History
  previousAccidents: "Minor fender bender in 2020, no injuries",
  allergies: "Penicillin, shellfish",
  drinksAlcohol: "occasionally",
  smokes: "no",
  familyHistory: {
    heartTrouble: true,
    stroke: false,
    diabetes: true,
    cancer: false,
    arthritis: true,
    highBloodPressure: true,
    kidneyDisease: false,
    mentalIllness: false,
    asthma: false,
    epilepsy: false,
    kyphosis: false,
    lungDisease: false,
    osteoporosis: false,
    migraines: true,
    scoliosis: false,
    spineProblems: true,
    other: false,
  },
  
  // Pain & Symptoms
  painLocation: "Lower back, neck, right shoulder",
  painDescription: {
    sharp: true,
    dull: true,
    achy: true,
    burning: false,
    shooting: true,
    stabbing: false,
    deep: true,
    spasm: true,
  },
  currentSymptoms: {
    headache: true,
    neckPain: true,
    neckStiff: true,
    upperBackPain: false,
    midBackPain: false,
    lowerBackPain: true,
    painArmsHands: false,
    painLegsFeet: false,
    lossStrengthArms: false,
    lossStrengthLegs: false,
    numbnessArmsHands: false,
    numbnessLegsFeet: false,
    tinglingArmsHands: false,
    tinglingLegsFeet: false,
    dizziness: true,
    fatigue: true,
    irritability: true,
  },
  
  // Systems Review
  systemReview: {
    fever: "no",
    chills: "no",
    fatigue: "yes",
    blurredVision: "sometimes",
    doubleVision: "no",
    eyePain: "no",
    ringingEars: "no",
    decreasedHearing: "no",
    difficultySwallowing: "no",
    chestPains: "no",
    palpitations: "no",
    swollenAnkles: "no",
    chronicCough: "no",
    difficultyBreathing: "no",
    nausea: "sometimes",
    vomiting: "no",
    abdominalPain: "no",
    backPain: "yes",
    neckPain: "yes",
    shoulderPain: "yes",
    weakness: "sometimes",
    dizziness: "yes",
    numbness: "no",
    depression: "no",
    anxiety: "sometimes",
    memoryLoss: "no",
  },
  
  // Communications
  alternativeCommunication: "Text messages preferred",
  emailConsent: "yes",
  
  // Release Information
  releasePersonOrganization: "State Farm Insurance",
  releaseAddress: "1 State Farm Plaza, Bloomington, IL 61710",
  releasePhone: "800-STATE-FARM",
  releaseReason: "Auto insurance claim processing",
  healthcareFacility: "Jackson Memorial Hospital",
  healthcareFacilityAddress: "1611 NW 12th Ave, Miami, FL 33136",
  healthcareFacilityPhone: "305-585-1111",
  treatmentDates: "12/15/2024 - Present",
  
  // Authorizations
  radiologySignature: "Maria Rodriguez",
  radiologyDate: "2024-12-20",
  patientSignature: "Maria Rodriguez",
  finalDate: "2024-12-20",
  
  painSeverity: "7",
  age: "39"
};

// Mock Cash Form Data - Generate unique test data
const mockCashFormData = {
  lastName: `Johnson-${timestamp}`,
  firstName: "Michael",
  address: "456 Oak Street",
  city: "Orlando",
  state: "FL",
  zip: "32801",
  homePhone: "407-555-1234",
  workPhone: "407-555-5678",
  cellPhone: "407-555-9012",
  email: `michael.johnson.${timestamp}@email.com`,
  driversLicense: "J987654321",
  driversLicenseState: "FL",
  emergencyContact: "Sarah Johnson",
  emergencyPhone: "407-555-3456",
  sex: "male",
  maritalStatus: "single",
  dob: "1990-08-22",
  ssn: "***-**-5678",
  age: "34",
  employmentStatus: "employed",
  employerName: "Tech Solutions Inc",
  employerAddress: "789 Business Park Dr, Orlando, FL 32803",
  studentStatus: "no",
  language: "en",
  autoInsurance: "Geico",
  policyNumber: "GC123456789",
  claimNumber: "CL987654321",
  adjusterName: "Jennifer Davis",
  healthInsurance: "Blue Cross Blue Shield",
  groupNumber: "BC789012",
  attorneyName: "",
  attorneyPhone: "",
  
  // Medical Information
  allergies: "None known",
  currentMedications: "Ibuprofen as needed",
  previousInjuries: "Sprained ankle in 2019",
  familyMedicalHistory: "Father has hypertension, mother has diabetes",
  smokingStatus: "never",
  drinkingHabits: "social",
  
  // Current Symptoms
  currentSymptoms: {
    headache: false,
    neckPain: true,
    backPain: true,
    shoulderPain: true,
    armPain: false,
    legPain: false,
    dizziness: false,
    fatigue: true,
    numbness: false,
    tingling: false,
  },
  
  painSeverity: "5",
  painLocation: "Neck and upper back",
  painDescription: "Dull aching pain that worsens with movement",
  
  // Consent and signatures
  consentAcknowledgement: true,
  signature: "Michael Johnson",
  date: "2024-12-20"
};

// Mock LOP Form Data - Generate unique test data
const mockLOPFormData = {
  lastName: `Williams-${timestamp}`,
  firstName: "Jennifer",
  address: "789 Pine Avenue",
  city: "Tampa",
  state: "FL",
  zip: "33602",
  homePhone: "813-555-2468",
  workPhone: "813-555-1357",
  cellPhone: "813-555-9753",
  email: `jennifer.williams.${timestamp}@email.com`,
  driversLicense: "W456789123",
  driversLicenseState: "FL",
  emergencyContact: "Robert Williams",
  emergencyPhone: "813-555-8642",
  sex: "female",
  maritalStatus: "divorced",
  dob: "1988-11-10",
  ssn: "***-**-9012",
  age: "36",
  employmentStatus: "employed",
  employerName: "Marketing Plus",
  employerAddress: "321 Corporate Blvd, Tampa, FL 33607",
  studentStatus: "no",
  language: "en",
  autoInsurance: "Progressive",
  policyNumber: "PR456789012",
  claimNumber: "CL123456789",
  adjusterName: "Mark Thompson",
  healthInsurance: "Aetna",
  groupNumber: "AE456789",
  
  // Attorney Information (required for LOP)
  attorneyName: "Smith & Associates Law Firm",
  attorneyPhone: "813-555-LAW1",
  attorneyAddress: "100 Legal Plaza, Tampa, FL 33601",
  attorneyEmail: "contact@smithlaw.com",
  
  // Medical Information
  allergies: "Latex, aspirin",
  currentMedications: "Birth control, vitamin D",
  previousInjuries: "None",
  familyMedicalHistory: "Mother has arthritis",
  smokingStatus: "former",
  drinkingHabits: "occasional",
  
  // Current Symptoms
  currentSymptoms: {
    headache: true,
    neckPain: true,
    backPain: false,
    shoulderPain: false,
    armPain: true,
    legPain: false,
    dizziness: true,
    fatigue: true,
    numbness: true,
    tingling: true,
  },
  
  painSeverity: "6",
  painLocation: "Neck, right arm, and head",
  painDescription: "Sharp shooting pain with numbness and tingling",
  
  // Consent and signatures
  consentAcknowledgement: true,
  signature: "Jennifer Williams",
  date: "2024-12-20"
};

// Mock New Form Data - Generate unique test data
const mockNewFormData = {
  // General Information
  lastName: `Davis-${timestamp}`,
  firstName: "Robert",
  address: "555 Maple Drive",
  city: "Jacksonville",
  state: "FL",
  zip: "32205",
  homePhone: "904-555-7890",
  workPhone: "904-555-2345",
  cellPhone: "904-555-6789",
  email: `robert.davis.${timestamp}@email.com`,
  licenseNumber: "D456123789",
  licenseState: "FL",
  dob: "1982-07-08",
  ssn: "***-**-3456",
  sex: "male",
  maritalStatus: "married",
  emergencyContact: "Linda Davis",
  emergencyPhone: "904-555-4321",
  employment: "self-employed",
  student: "no",
  
  // Accident Information
  accidentDate: "2024-12-18",
  accidentTime: "09:15",
  accidentDescription: "T-bone collision at intersection. Other driver ran red light and struck passenger side.",
  accidentLocation: "Main St and 1st Avenue intersection",
  accidentCity: "Jacksonville",
  personRole: "driver",
  vehicleMotion: "moving",
  headPosition: "straight",
  thrownDirection: "left",
  sawImpact: "yes",
  braceForImpact: "yes",
  hitCar: "no",
  hitCarDetails: "",
  wentToHospital: "yes",
  hospitalName: "UF Health Jacksonville",
  lossOfConsciousness: "brief",
  consciousnessLength: "2-3 minutes",
  
  // Vehicle & Insurance
  vehicleOwner: "Robert Davis",
  relationshipToOwner: "self",
  vehicleDriver: "Robert Davis",
  relationshipToDriver: "self",
  householdMembers: "3",
  ownedVehicles: "2",
  
  // Medical History
  previousAccidents: "No previous motor vehicle accidents",
  allergies: "Peanuts",
  drinksAlcohol: "rarely",
  smokes: "no",
  familyHistory: {
    heartTrouble: false,
    stroke: false,
    diabetes: false,
    cancer: true,
    arthritis: false,
    highBloodPressure: false,
    kidneyDisease: false,
    mentalIllness: false,
    asthma: true,
    epilepsy: false,
    kyphosis: false,
    lungDisease: false,
    osteoporosis: false,
    migraines: false,
    scoliosis: false,
    spineProblems: false,
    other: false,
  },
  
  // Pain & Symptoms
  painLocation: "Left shoulder, ribs, and hip",
  painDescription: {
    sharp: true,
    dull: false,
    achy: true,
    burning: false,
    shooting: false,
    stabbing: true,
    deep: true,
    spasm: false,
  },
  currentSymptoms: {
    headache: false,
    neckPain: false,
    neckStiff: false,
    upperBackPain: false,
    midBackPain: false,
    lowerBackPain: false,
    painArmsHands: true,
    painLegsFeet: true,
    lossStrengthArms: false,
    lossStrengthLegs: false,
    numbnessArmsHands: false,
    numbnessLegsFeet: false,
    tinglingArmsHands: false,
    tinglingLegsFeet: false,
    dizziness: false,
    fatigue: false,
    irritability: false,
  },
  
  // Systems Review
  systemReview: {
    fever: "no",
    chills: "no",
    fatigue: "no",
    blurredVision: "no",
    doubleVision: "no",
    eyePain: "no",
    ringingEars: "no",
    decreasedHearing: "no",
    difficultySwallowing: "no",
    chestPains: "yes",
    palpitations: "no",
    swollenAnkles: "no",
    chronicCough: "no",
    difficultyBreathing: "sometimes",
    nausea: "no",
    vomiting: "no",
    abdominalPain: "no",
    backPain: "no",
    neckPain: "no",
    shoulderPain: "yes",
    weakness: "no",
    dizziness: "no",
    numbness: "no",
    depression: "no",
    anxiety: "no",
    memoryLoss: "no",
  },
  
  // Communications
  alternativeCommunication: "Email preferred",
  emailConsent: "yes",
  
  // Release Information
  releasePersonOrganization: "Allstate Insurance",
  releaseAddress: "2775 Sanders Rd, Northbrook, IL 60062",
  releasePhone: "800-ALLSTATE",
  releaseReason: "Auto insurance claim processing",
  healthcareFacility: "UF Health Jacksonville",
  healthcareFacilityAddress: "655 W 8th St, Jacksonville, FL 32209",
  healthcareFacilityPhone: "904-244-0411",
  treatmentDates: "12/18/2024 - Present",
  
  // Authorizations
  radiologySignature: "Robert Davis",
  radiologyDate: "2024-12-20",
  patientSignature: "Robert Davis",
  finalDate: "2024-12-20",
  
  painSeverity: "8",
  age: "42"
};

// Submission Functions
export const submitMockPIPForm = async () => {
  console.log('Submitting mock PIP form...');
  
  try {
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formType: 'pip',
        formData: mockPIPFormData,
        honeypot: ''
      }
    });
    
    if (error) {
      console.error('Error submitting mock PIP form:', error);
      return { success: false, error };
    }
    
    console.log('Mock PIP form submitted successfully:', data);
    return { success: true, data, patientName: `${mockPIPFormData.firstName} ${mockPIPFormData.lastName}` };
    
  } catch (error) {
    console.error('Exception submitting mock PIP form:', error);
    return { success: false, error };
  }
};

export const submitMockCashForm = async () => {
  console.log('Submitting mock Cash form...');
  
  try {
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formType: 'cash',
        formData: mockCashFormData,
        honeypot: ''
      }
    });
    
    if (error) {
      console.error('Error submitting mock Cash form:', error);
      return { success: false, error };
    }
    
    console.log('Mock Cash form submitted successfully:', data);
    return { success: true, data, patientName: `${mockCashFormData.firstName} ${mockCashFormData.lastName}` };
    
  } catch (error) {
    console.error('Exception submitting mock Cash form:', error);
    return { success: false, error };
  }
};

export const submitMockLOPForm = async () => {
  console.log('Submitting mock LOP form...');
  
  try {
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formType: 'lop',
        formData: mockLOPFormData,
        honeypot: ''
      }
    });
    
    if (error) {
      console.error('Error submitting mock LOP form:', error);
      return { success: false, error };
    }
    
    console.log('Mock LOP form submitted successfully:', data);
    return { success: true, data, patientName: `${mockLOPFormData.firstName} ${mockLOPFormData.lastName}` };
    
  } catch (error) {
    console.error('Exception submitting mock LOP form:', error);
    return { success: false, error };
  }
};

export const submitMockNewForm = async () => {
  console.log('Submitting mock New form...');
  
  try {
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formType: 'new',
        formData: mockNewFormData,
        honeypot: ''
      }
    });
    
    if (error) {
      console.error('Error submitting mock New form:', error);
      return { success: false, error };
    }
    
    console.log('Mock New form submitted successfully:', data);
    return { success: true, data, patientName: `${mockNewFormData.firstName} ${mockNewFormData.lastName}` };
    
  } catch (error) {
    console.error('Exception submitting mock New form:', error);
    return { success: false, error };
  }
};

// Submit all mock forms
export const submitAllMockForms = async () => {
  console.log('Submitting all mock forms...');
  
  const results = {
    pip: await submitMockPIPForm(),
    cash: await submitMockCashForm(),
    lop: await submitMockLOPForm(),
    new: await submitMockNewForm()
  };
  
  console.log('All mock form submissions completed:', results);
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`Successfully submitted ${successCount}/${totalCount} mock forms`);
  
  return results;
};

// Test SOAP autopopulation
export const testSOAPAutopopulation = async (patientId: string) => {
  console.log('Testing SOAP note autopopulation for patient:', patientId);
  
  try {
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (patientError) {
      console.error('Error fetching patient:', patientError);
      return { success: false, error: patientError };
    }
    
    console.log('Updated patient data:', patient);
    
    // Test SOAP mapping functions
    const { autofillSOAPFromPatient } = await import('@/utils/soapFormMapping');
    const soapData = autofillSOAPFromPatient(patient);
    
    console.log('SOAP autofill data:', soapData);
    
    return { 
      success: true, 
      patient, 
      soapData,
      message: 'Patient updated and SOAP data mapped successfully'
    };
    
  } catch (error) {
    console.error('Exception testing SOAP autopopulation:', error);
    return { success: false, error };
  }
};

// Auto-execute all mock submissions when this file is imported
console.log('Mock form submissions module loaded - ready to test autopopulation');