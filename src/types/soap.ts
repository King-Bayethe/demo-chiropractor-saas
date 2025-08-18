// Unified SOAP Note Data Structures
// This file defines the standard data formats used across all SOAP components

export interface UnifiedSOAPNote {
  // Core identification
  id?: string;
  patient_id: string;
  provider_id?: string;
  provider_name: string;
  appointment_id?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  date_of_service: string | Date;
  chief_complaint: string;
  is_draft: boolean;
  
  // SOAP sections
  subjective_data: SubjectiveData;
  objective_data: ObjectiveData;
  assessment_data: AssessmentData;
  plan_data: PlanData;
  vital_signs?: VitalSigns;
}

export interface SubjectiveData {
  symptoms: string[];
  painScale: number | null;
  painDescription: string;
  otherSymptoms: string;
  isRefused: boolean;
  isWithinNormalLimits: boolean;
  // Additional fields for comprehensive notes
  historyOfPresentIllness?: string;
  reviewOfSystems?: any; // Keep as any for backward compatibility with existing components
  pastMedicalHistory?: string[];
  medications?: string | string[]; // Support both formats for compatibility
  allergies?: string[];
  socialHistory?: string;
  familyHistory?: string;
}

export interface VitalSigns {
  height: string;
  weight: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  bmi?: string;
  painLevel?: number;
}

export interface SystemExam {
  system: string;
  findings: string;
  isNormal: boolean;
  isNotExamined: boolean;
}

export interface SpecialTest {
  testName: string;
  result: string;
  isPositive: boolean;
  notes: string;
}

export interface ImagingLab {
  type: 'imaging' | 'lab';
  name: string;
  result: string;
  date: string;
  notes: string;
}

export interface Procedure {
  name: string;
  description: string;
  outcome: string;
  complications: string;
}

export interface ObjectiveData {
  vitalSigns: VitalSigns;
  systemExams: SystemExam[];
  specialTests: SpecialTest[];
  imagingLabs: ImagingLab[];
  procedures: Procedure[];
  // Additional physical exam findings
  generalAppearance?: string;
  neurologicalExam?: any;
  musculoskeletalExam?: any;
}

export interface Diagnosis {
  condition: string;
  icd10Code: string;
  description: string;
  isPrimary: boolean;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface AssessmentData {
  diagnoses: Diagnosis[];
  clinicalImpression: string;
  differentialDiagnoses?: string[];
  prognosis?: string;
  complications?: string[];
}

export interface Treatment {
  type: 'medication' | 'therapy' | 'procedure' | 'lifestyle';
  name: string;
  description: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  indication: string;
}

export interface PlanData {
  treatments: Treatment[];
  customTreatment: string;
  medications: Medication[];
  followUpPeriod: string;
  customFollowUp: string;
  hasEmergencyDisclaimer: boolean;
  legalTags: string[];
  additionalInstructions: string;
  // Additional plan fields
  diagnosticTests?: string[];
  referrals?: string[];
  patientEducation?: string[];
  preventiveCare?: string[];
}

// Form data interface for wizard/form components
export interface SOAPFormData {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  dateCreated: Date;
  chiefComplaint: string;
  isQuickNote: boolean;
  subjective: SubjectiveData;
  objective: ObjectiveData;
  assessment: AssessmentData;
  plan: PlanData;
}

// Wizard data interface for step-by-step flow
export interface WizardData {
  patientOverview?: {
    chiefComplaint: string;
    dateOfService: Date;
    appointmentType: string;
  };
  subjective?: SubjectiveData;
  objective?: ObjectiveData;
  assessment?: AssessmentData;
  plan?: PlanData;
}

// Conversion utilities
export class SOAPDataConverter {
  // Convert from wizard data to unified format
  static wizardToUnified(wizardData: WizardData, patientId: string, providerName: string): UnifiedSOAPNote {
    return {
      patient_id: patientId,
      provider_name: providerName,
      date_of_service: wizardData.patientOverview?.dateOfService || new Date(),
      chief_complaint: wizardData.patientOverview?.chiefComplaint || '',
      is_draft: false,
      subjective_data: wizardData.subjective || this.getDefaultSubjective(),
      objective_data: wizardData.objective || this.getDefaultObjective(),
      assessment_data: wizardData.assessment || this.getDefaultAssessment(),
      plan_data: wizardData.plan || this.getDefaultPlan(),
      vital_signs: wizardData.objective?.vitalSigns
    };
  }

  // Convert from form data to unified format
  static formToUnified(formData: SOAPFormData): UnifiedSOAPNote {
    return {
      patient_id: formData.patientId,
      provider_name: formData.providerName,
      date_of_service: formData.dateCreated,
      chief_complaint: formData.chiefComplaint,
      is_draft: formData.isQuickNote,
      subjective_data: formData.subjective,
      objective_data: formData.objective,
      assessment_data: formData.assessment,
      plan_data: formData.plan,
      vital_signs: formData.objective.vitalSigns
    };
  }

  // Convert from unified format to form data
  static unifiedToForm(unifiedData: UnifiedSOAPNote, patientName: string): SOAPFormData {
    return {
      patientId: unifiedData.patient_id,
      patientName: patientName,
      providerId: unifiedData.provider_id || 'dr-silverman',
      providerName: unifiedData.provider_name,
      dateCreated: new Date(unifiedData.date_of_service),
      chiefComplaint: unifiedData.chief_complaint,
      isQuickNote: unifiedData.is_draft,
      subjective: unifiedData.subjective_data,
      objective: unifiedData.objective_data,
      assessment: unifiedData.assessment_data,
      plan: unifiedData.plan_data
    };
  }

  // Convert from unified format to wizard data
  static unifiedToWizard(unifiedData: UnifiedSOAPNote): WizardData {
    return {
      patientOverview: {
        chiefComplaint: unifiedData.chief_complaint,
        dateOfService: new Date(unifiedData.date_of_service),
        appointmentType: 'regular'
      },
      subjective: unifiedData.subjective_data,
      objective: unifiedData.objective_data,
      assessment: unifiedData.assessment_data,
      plan: unifiedData.plan_data
    };
  }

  // Default data structures
  static getDefaultSubjective(): SubjectiveData {
    return {
      symptoms: [],
      painScale: null,
      painDescription: '',
      otherSymptoms: '',
      isRefused: false,
      isWithinNormalLimits: false
    };
  }

  static getDefaultObjective(): ObjectiveData {
    return {
      vitalSigns: {
        height: '',
        weight: '',
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: ''
      },
      systemExams: [],
      specialTests: [],
      imagingLabs: [],
      procedures: []
    };
  }

  static getDefaultAssessment(): AssessmentData {
    return {
      diagnoses: [],
      clinicalImpression: ''
    };
  }

  static getDefaultPlan(): PlanData {
    return {
      treatments: [],
      customTreatment: '',
      medications: [],
      followUpPeriod: '',
      customFollowUp: '',
      hasEmergencyDisclaimer: true,
      legalTags: [],
      additionalInstructions: ''
    };
  }
}