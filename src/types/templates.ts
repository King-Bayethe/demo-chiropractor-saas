export interface CustomTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  specialty: string;
  keywords: string[];
  age_groups?: string[];
  ageGroups: string[];
  urgency_level?: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  template_data?: any;
  templateData: {
    chiefComplaint: string;
    subjectiveTemplate: {
      symptoms: string[];
      painDescription: string;
      otherSymptoms: string;
    };
    objectiveTemplate: {
      systemExams: any[];
      specialTests: any[];
    };
    assessmentTemplate: {
      diagnoses: any[];
      clinicalImpression: string;
    };
    planTemplate: {
      treatments: any[];
      medications: any[];
      followUpPeriod: string;
      additionalInstructions: string;
    };
  };
  created_by?: string;
  is_approved?: boolean;
  is_active?: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  template_name: string;
  template_type: string;
  used_by: string;
  patient_id: string;
  chief_complaint: string;
  created_at: string;
}