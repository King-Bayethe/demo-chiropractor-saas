export interface MockAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  appointment_type: string;
  provider_name: string;
  provider_id: string;
  description: string;
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

export const mockAppointments: MockAppointment[] = [
  // Today's appointments
  {
    id: "apt-1",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    patient_email: "maria.rodriguez@email.com",
    patient_phone: "(555) 123-4567",
    title: "Follow-up Treatment - Maria Rodriguez",
    start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
    end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
    status: "scheduled",
    appointment_type: "Follow-up Treatment",
    provider_name: "Dr. Sarah Johnson",
    provider_id: "provider-1",
    description: "Continuing physical therapy for L4-L5 disc herniation",
    location: "Treatment Room A",
    notes: "Patient reports 40% improvement in pain levels",
    created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt-2", 
    patient_id: "2",
    patient_name: "James Thompson",
    patient_email: "james.thompson@email.com", 
    patient_phone: "(555) 234-5678",
    title: "Cervical Manipulation - James Thompson",
    start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).toISOString(),
    end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 15).toISOString(),
    status: "scheduled",
    appointment_type: "Chiropractic Adjustment",
    provider_name: "Dr. Michael Chen", 
    provider_id: "provider-2",
    description: "Cervical spine manipulation for radiculopathy",
    location: "Adjustment Room B",
    notes: "Patient responding well to treatment protocol",
    created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt-3",
    patient_id: "4",
    patient_name: "Robert Martinez",
    patient_email: "robert.martinez@email.com",
    patient_phone: "(555) 456-7890", 
    title: "Injection Consultation - Robert Martinez",
    start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
    end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 45).toISOString(),
    status: "scheduled",
    appointment_type: "Injection Therapy",
    provider_name: "Dr. Emily Rodriguez",
    provider_id: "provider-3", 
    description: "Corticosteroid injection for shoulder impingement",
    location: "Procedure Room",
    notes: "Pre-injection evaluation and consent",
    created_at: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Tomorrow's appointments
  {
    id: "apt-4",
    patient_id: "3", 
    patient_name: "Linda Davis",
    patient_email: "linda.davis@email.com",
    patient_phone: "(555) 345-6789",
    title: "Orthopedic Follow-up - Linda Davis", 
    start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0).toISOString(),
    end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0).toISOString(),
    status: "scheduled",
    appointment_type: "Orthopedic Consultation",
    provider_name: "Dr. James Wilson",
    provider_id: "provider-4",
    description: "Post-surgical evaluation for meniscus repair",
    location: "Consultation Room C",
    notes: "2 weeks post-arthroscopy, suture removal",
    created_at: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt-5",
    patient_id: "5",
    patient_name: "Amanda Wilson", 
    patient_email: "amanda.wilson@email.com",
    patient_phone: "(555) 567-8901",
    title: "Postpartum PT - Amanda Wilson",
    start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 30).toISOString(),
    end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 30).toISOString(),
    status: "scheduled", 
    appointment_type: "Physical Therapy",
    provider_name: "Lisa Thompson, PT",
    provider_id: "provider-5",
    description: "Postpartum core strengthening and pelvic floor therapy",
    location: "Physical Therapy Gym",
    notes: "Focus on diastasis recti exercises",
    created_at: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Day after tomorrow
  {
    id: "apt-6",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    patient_email: "maria.rodriguez@email.com", 
    patient_phone: "(555) 123-4567",
    title: "Physical Therapy - Maria Rodriguez",
    start_time: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 9, 30).toISOString(),
    end_time: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 10, 30).toISOString(),
    status: "scheduled",
    appointment_type: "Physical Therapy", 
    provider_name: "Mark Johnson, PT",
    provider_id: "provider-6",
    description: "Lumbar spine rehabilitation and core strengthening",
    location: "Physical Therapy Gym", 
    notes: "Progress to resistance exercises if tolerated",
    created_at: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Past appointments (completed)
  {
    id: "apt-7",
    patient_id: "2",
    patient_name: "James Thompson",
    patient_email: "james.thompson@email.com",
    patient_phone: "(555) 234-5678",
    title: "Initial Consultation - James Thompson", 
    start_time: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate(), 14, 0).toISOString(),
    end_time: new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate(), 15, 30).toISOString(),
    status: "completed",
    appointment_type: "Initial Consultation",
    provider_name: "Dr. Michael Chen",
    provider_id: "provider-2", 
    description: "Comprehensive evaluation for workplace neck injury",
    location: "Examination Room A",
    notes: "Complete history and physical, X-rays ordered",
    created_at: new Date(lastWeek.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: lastWeek.toISOString()
  },
  {
    id: "apt-8",
    patient_id: "4", 
    patient_name: "Robert Martinez",
    patient_email: "robert.martinez@email.com",
    patient_phone: "(555) 456-7890",
    title: "Diabetes Check-in - Robert Martinez",
    start_time: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 11, 0).toISOString(),
    end_time: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 11, 30).toISOString(),
    status: "completed",
    appointment_type: "Medical Consultation", 
    provider_name: "Dr. Emily Rodriguez",
    provider_id: "provider-3",
    description: "Diabetes management coordination with shoulder treatment",
    location: "Consultation Room B",
    notes: "HbA1c stable, cleared for steroid injection",
    created_at: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: yesterday.toISOString()
  },

  // New patient appointments (future)
  {
    id: "apt-9",
    patient_id: "new-1",
    patient_name: "David Chen",
    patient_email: "david.chen@email.com",
    patient_phone: "(555) 678-9012",
    title: "New Patient Consultation - David Chen",
    start_time: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: "scheduled",
    appointment_type: "New Patient Consultation",
    provider_name: "Dr. Sarah Johnson", 
    provider_id: "provider-1",
    description: "Initial evaluation for lower back pain following car accident",
    location: "Examination Room A",
    notes: "PIP case, attorney referred",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "apt-10",
    patient_id: "new-2",
    patient_name: "Sarah Kim",
    patient_email: "sarah.kim@email.com", 
    patient_phone: "(555) 789-0123",
    title: "Cash Patient Consultation - Sarah Kim",
    start_time: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    appointment_type: "Cash Consultation",
    provider_name: "Dr. Michael Chen",
    provider_id: "provider-2",
    description: "Self-pay patient seeking treatment for chronic headaches",
    location: "Consultation Room C", 
    notes: "Patient prefers cash payment plan",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];