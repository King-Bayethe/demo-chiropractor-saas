// Generic Healthcare Type Definitions
// Supports any medical practice type

export const PAYMENT_TYPES = [
  'Private Insurance',
  'Medicare',
  'Medicaid',
  'Self-Pay',
  'Payment Plan',
  'Workers Compensation',
  'PIP', // Auto Insurance Personal Injury Protection
] as const;

export const CARE_TYPES = [
  'Acute Care',
  'Chronic Care',
  'Preventive Care',
  'Specialty Consultation',
  'Emergency/Urgent',
  'Follow-up',
  'Annual Physical',
] as const;

export const APPOINTMENT_TYPES = [
  'Initial Consultation',
  'Follow-up Visit',
  'Annual Physical',
  'Wellness Exam',
  'Diagnostic Procedure',
  'Therapy Session',
  'Lab Work',
  'Telemedicine',
  'Urgent Care',
  'Specialist Consultation',
  'Vaccination',
  'Preventive Care',
] as const;

export const REFERRAL_SOURCES = [
  'Physician Referral',
  'Patient Referral',
  'Online Marketing',
  'Insurance Network',
  'Website',
  'Social Media',
  'Walk-in',
  'Phone Call',
  'Email',
  'Community Outreach',
  'Emergency Department',
  'Other',
] as const;

export const MEDICAL_SPECIALTIES = [
  'Primary Care',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'OB/GYN',
  'Psychiatry',
  'Dermatology',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Rheumatology',
  'Oncology',
  'Physical Therapy',
  'Chiropractic',
  'Mental Health',
  'Dental',
  'Ophthalmology',
  'ENT',
  'Urology',
  'Pain Management',
  'Sports Medicine',
  'General Surgery',
] as const;

export const PATIENT_PRIORITIES = [
  'Routine',
  'Moderate',
  'High',
  'Urgent',
  'Emergency',
] as const;

export type PaymentType = typeof PAYMENT_TYPES[number];
export type CareType = typeof CARE_TYPES[number];
export type AppointmentType = typeof APPOINTMENT_TYPES[number];
export type ReferralSource = typeof REFERRAL_SOURCES[number];
export type MedicalSpecialty = typeof MEDICAL_SPECIALTIES[number];
export type PatientPriority = typeof PATIENT_PRIORITIES[number];

// Helper function to get all payment types
export const getPaymentTypes = () => [...PAYMENT_TYPES];

// Helper function to get all care types
export const getCareTypes = () => [...CARE_TYPES];

// Helper function to get all appointment types  
export const getAppointmentTypes = () => [...APPOINTMENT_TYPES];

// Helper function to get all referral sources
export const getReferralSources = () => [...REFERRAL_SOURCES];

// Helper function to get all specialties
export const getMedicalSpecialties = () => [...MEDICAL_SPECIALTIES];

// Helper function to get all priorities
export const getPatientPriorities = () => [...PATIENT_PRIORITIES];
