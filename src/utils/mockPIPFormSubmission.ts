import { supabase } from "@/integrations/supabase/client";

// Comprehensive mock PIP form data that matches PublicPIPForm structure
const mockPIPFormData = {
  // General Information
  lastName: "Rodriguez",
  firstName: "Maria",
  address: "123 Medical Center Blvd",
  city: "Miami",
  state: "FL",
  zip: "33101",
  homePhone: "305-555-0123",
  workPhone: "305-555-0456",
  cellPhone: "305-555-0789",
  email: "maria.rodriguez@email.com",
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
  
  // Insurance & Legal
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
  
  // Review of Systems
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
  
  // Additional calculated fields
  painSeverity: "7",
  age: "39"
};

export const submitMockPIPForm = async () => {
  console.log('Submitting comprehensive mock PIP form...');
  
  try {
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formType: 'pip',
        formData: mockPIPFormData,
        honeypot: '' // Empty honeypot field for legitimate submission
      }
    });
    
    if (error) {
      console.error('Error submitting mock PIP form:', error);
      return { success: false, error };
    }
    
    console.log('Mock PIP form submitted successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Exception submitting mock PIP form:', error);
    return { success: false, error };
  }
};

// Function to test SOAP note autopopulation after form submission
export const testSOAPAutopopulation = async (patientId: string) => {
  console.log('Testing SOAP note autopopulation for patient:', patientId);
  
  try {
    // Fetch the updated patient data
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

// Auto-execute the mock submission when this file is imported
submitMockPIPForm().then(result => {
  console.log('Mock PIP form submission result:', result);
  
  if (result.success && result.data?.patient_id) {
    // Test SOAP autopopulation with the created/updated patient
    testSOAPAutopopulation(result.data.patient_id).then(soapResult => {
      console.log('SOAP autopopulation test result:', soapResult);
    });
  }
});