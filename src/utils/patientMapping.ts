import { Patient } from "@/hooks/usePatients";

// Maps Supabase patient data to PatientProfileHeader format
export const mapSupabasePatientToProfileHeader = (patient: Patient) => {
  const fullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Unknown Patient';
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: Date | string | null) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format address from individual fields
  const formatAddress = (patient: Patient) => {
    const addressParts = [
      patient.address,
      patient.city,
      patient.state,
      patient.zip_code
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : undefined;
  };

  // Extract medical history from medical_systems_review
  const extractMedicalHistory = (medicalSystemsReview: any) => {
    if (!medicalSystemsReview || typeof medicalSystemsReview !== 'object') return [];
    
    const conditions: string[] = [];
    Object.entries(medicalSystemsReview).forEach(([system, data]) => {
      if (data && typeof data === 'object' && (data as any).hasSymptoms) {
        conditions.push(system.replace(/([A-Z])/g, ' $1').trim());
      }
    });
    
    return conditions;
  };

  return {
    id: patient.id,
    name: fullName,
    dateOfBirth: patient.date_of_birth || new Date().toISOString(),
    age: calculateAge(patient.date_of_birth),
    gender: patient.gender || 'Not specified',
    email: patient.email,
    phone: patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone,
    address: formatAddress(patient),
    avatar: undefined, // No avatar field in current schema
    medicalHistory: extractMedicalHistory(patient.medical_systems_review),
    allergies: [], // TODO: Add allergies field to patient schema if needed
    emergencyContact: patient.emergency_contact_name && patient.emergency_contact_phone ? {
      name: patient.emergency_contact_name,
      phone: patient.emergency_contact_phone,
      relationship: 'Emergency Contact'
    } : undefined,
  };
};

// Maps Supabase patient data to patient list display format
export const mapSupabasePatientToListItem = (patient: Patient) => {
  return {
    id: patient.id,
    firstName: patient.first_name,
    lastName: patient.last_name,
    name: [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Unknown Patient',
    email: patient.email,
    phone: patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone,
    tags: patient.tags || [],
    ghlContactId: patient.ghl_contact_id,
    isActive: patient.is_active,
    createdAt: patient.created_at,
    updatedAt: patient.updated_at,
  };
};

// Determines patient type based on case_type field, tags, or form submission
export const getPatientType = (patient: Patient | null | undefined) => {
  // Handle null/undefined patient
  if (!patient) {
    return 'Insurance'; // Default case type
  }
  
  // Use case_type field as primary source
  if (patient.case_type) {
    return patient.case_type;
  }
  
  const tags = patient.tags || [];
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) {
    return 'PIP';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) {
    return 'Insurance';
  }
  
  // Check if they submitted a PIP form
  if (patient.pip_form_submitted_at) {
    return 'PIP';
  }
  
  return 'Insurance';
};

// Get case type display name
export const getCaseTypeDisplayName = (caseType: string) => {
  const caseTypeMap: Record<string, string> = {
    'PIP': 'PIP Patient',
    'Insurance': 'Insurance Patient',
    'Slip and Fall': 'Slip & Fall Patient',
    'Workers Compensation': 'Workers Comp Patient', 
    'Cash Plan': 'Cash Plan Patient',
    'Attorney Only': 'Attorney Only Patient'
  };
  
  return caseTypeMap[caseType] || caseType || 'Patient';
};

// Get case type variant for badges and styling
export const getCaseTypeVariant = (caseType: string) => {
  switch (caseType) {
    case 'PIP':
      return 'bg-case-pip/10 text-case-pip border-case-pip/20';
    case 'Insurance':
      return 'bg-case-insurance/10 text-case-insurance border-case-insurance/20';
    case 'Slip and Fall':
      return 'bg-case-slip-fall/10 text-case-slip-fall border-case-slip-fall/20';
    case 'Workers Compensation':
      return 'bg-case-workers-comp/10 text-case-workers-comp border-case-workers-comp/20';
    case 'Cash Plan':
      return 'bg-case-cash-plan/10 text-case-cash-plan border-case-cash-plan/20';
    case 'Attorney Only':
      return 'bg-case-attorney-only/10 text-case-attorney-only border-case-attorney-only/20';
    default:
      return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
  }
};

// Get patient type variant for badges (backwards compatibility)
export const getPatientTypeVariant = (patientType: string) => {
  // Map old format to new format
  const normalizedType = patientType.replace(' Patient', '');
  return getCaseTypeVariant(normalizedType);
};