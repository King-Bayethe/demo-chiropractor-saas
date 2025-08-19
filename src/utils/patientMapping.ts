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

// Determines patient type based on tags or form submission
export const getPatientType = (patient: Patient) => {
  const tags = patient.tags || [];
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('pip'))) {
    return 'PIP Patient';
  }
  
  if (tags.some((tag: string) => tag.toLowerCase().includes('general'))) {
    return 'General Patient';
  }
  
  // Check if they submitted a PIP form
  if (patient.pip_form_submitted_at) {
    return 'PIP Patient';
  }
  
  return 'Patient';
};

// Get patient type variant for badges
export const getPatientTypeVariant = (patientType: string) => {
  switch (patientType) {
    case 'PIP Patient':
      return 'bg-medical-teal/10 text-medical-teal';
    case 'General Patient':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-secondary/10 text-secondary-foreground';
  }
};