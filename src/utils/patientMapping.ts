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

// Generic healthcare payment/insurance type mapping
export const getPatientType = (patient: Patient | null | undefined) => {
  // Handle null/undefined patient
  if (!patient) {
    return 'Private Insurance'; // Default case type
  }
  
  // Use case_type field as primary source
  if (patient.case_type) {
    return patient.case_type;
  }
  
  const tags = patient.tags || [];
  
  // Map old types to new types for backwards compatibility
  if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) {
    return 'PIP';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('medicare'))) {
    return 'Medicare';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('medicaid'))) {
    return 'Medicare';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('cash') || tag.toLowerCase().includes('self-pay'))) {
    return 'Self-Pay';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('workers') || tag.toLowerCase().includes('comp'))) {
    return 'Workers Compensation';
  }
  
  // Check if they submitted a PIP form (legacy)
  if (patient.pip_form_submitted_at) {
    return 'PIP';
  }
  
  return 'Private Insurance';
};

// Get case type display name - generic healthcare
export const getCaseTypeDisplayName = (caseType: string) => {
  const caseTypeMap: Record<string, string> = {
    // Insurance types
    'Private Insurance': 'Private Insurance',
    'Insurance': 'Private Insurance',
    'Medicare': 'Medicare/Medicaid',
    'Medicaid': 'Medicare/Medicaid',
    'Self-Pay': 'Self-Pay (Cash)',
    'Cash Plan': 'Self-Pay (Cash)',
    'Payment Plan': 'Payment Plan',
    
    // Special types
    'Workers Compensation': 'Workers Comp',
    'PIP': 'Auto Insurance (PIP)',
    'Slip and Fall': 'Injury Case',
    'Attorney Only': 'Legal Referral',
    
    // Care types
    'Acute Care': 'Acute Care',
    'Chronic Care': 'Chronic Care',
    'Preventive Care': 'Preventive Care',
    'Specialty': 'Specialty Care'
  };
  
  return caseTypeMap[caseType] || caseType || 'Patient';
};

// Get case type variant for badges and styling - generic healthcare
export const getCaseTypeVariant = (caseType: string) => {
  switch (caseType) {
    // Insurance types - blue tones
    case 'Private Insurance':
    case 'Insurance':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'Medicare':
    case 'Medicaid':
      return 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20';
    case 'Self-Pay':
    case 'Cash Plan':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'Payment Plan':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    
    // Special case types - yellow/orange tones
    case 'Workers Compensation':
      return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    case 'PIP':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    case 'Slip and Fall':
    case 'Attorney Only':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    
    // Care types - purple tones
    case 'Acute Care':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    case 'Chronic Care':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    case 'Preventive Care':
      return 'bg-teal-500/10 text-teal-700 border-teal-500/20';
    case 'Specialty':
      return 'bg-violet-500/10 text-violet-700 border-violet-500/20';
    
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

// Get patient type variant for badges (backwards compatibility)
export const getPatientTypeVariant = (patientType: string) => {
  // Map old format to new format
  const normalizedType = patientType.replace(' Patient', '');
  return getCaseTypeVariant(normalizedType);
};