import { useProfile } from './useProfile';
import { mockPatients } from '@/data/mockPatients';
import { mockSOAPNotes } from '@/data/mockSOAPNotes';
import { mockAppointments } from '@/data/mockAppointments';
import { mockConversations } from '@/data/mockConversations';
import { mockDocuments } from '@/data/mockDocuments';
import { mockInvoices } from '@/data/mockInvoices';
import { mockNotifications } from '@/data/mockNotifications';
import { useState, useEffect } from 'react';

// Enhanced mock opportunities data for demo users
const mockOpportunities = [
  {
    id: '1',
    name: 'PIP Case - Maria Rodriguez MVA',
    description: 'Motor vehicle accident case with L4-L5 disc herniation requiring comprehensive treatment',
    patient_name: 'Maria Rodriguez',
    patient_id: '1',
    patient_email: 'maria.rodriguez@email.com',
    patient_phone: '(555) 123-4567',
    case_type: 'PIP',
    source: 'PIP Form',
    pipeline_stage: 'treatment',
    status: 'active',
    estimated_value: 15000,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-25').toISOString(),
    created_by: 'demo-user-id',
    priority: 'high',
    expected_close_date: '2024-03-15',
    treatment_start_date: '2024-01-22',
    tags: ['PIP', 'MVA', 'High-Priority', 'Disc Herniation'],
    attorney_name: 'Johnson & Associates',
    attorney_contact: '(555) 999-0001',
    referral_source: 'Attorney Referral'
  },
  {
    id: '2',
    name: 'Workers Comp - James Thompson',
    description: 'Construction worker with cervical strain and radiculopathy from workplace injury',
    patient_name: 'James Thompson',
    patient_id: '2',
    patient_email: 'james.thompson@email.com',
    patient_phone: '(555) 234-5678',
    case_type: 'Workers Comp',
    source: 'Employer Referral',
    pipeline_stage: 'treatment',
    status: 'active',
    estimated_value: 8500,
    created_at: new Date('2024-01-16').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
    created_by: 'demo-user-id',
    priority: 'medium',
    expected_close_date: '2024-04-16',
    treatment_start_date: '2024-01-20',
    tags: ['Workers Comp', 'Cervical', 'Construction'],
    referral_source: 'ABC Construction Company'
  },
  {
    id: '3',
    name: 'Sports Injury - Linda Davis',
    description: 'Soccer athlete with meniscus tear and MCL sprain requiring surgical evaluation',
    patient_name: 'Linda Davis',
    patient_id: '3',
    patient_email: 'linda.davis@email.com',
    patient_phone: '(555) 345-6789',
    case_type: 'Sports Injury',
    source: 'Self-Referral',
    pipeline_stage: 'consultation',
    status: 'active',
    estimated_value: 12000,
    created_at: new Date('2024-01-17').toISOString(),
    updated_at: new Date('2024-01-21').toISOString(),
    created_by: 'demo-user-id',
    priority: 'high',
    expected_close_date: '2024-05-17',
    treatment_start_date: '2024-01-21',
    tags: ['Sports', 'Soccer', 'Meniscus', 'Surgery'],
    referral_source: 'Sports Medicine Clinic'
  },
  {
    id: '4',
    name: 'Chronic Pain - Robert Martinez',
    description: 'Diabetic patient with rotator cuff impingement requiring careful pain management',
    patient_name: 'Robert Martinez',
    patient_id: '4',
    patient_email: 'robert.martinez@email.com',
    patient_phone: '(555) 456-7890',
    case_type: 'Chronic Pain',
    source: 'Medical Referral',
    pipeline_stage: 'treatment',
    status: 'active',
    estimated_value: 6500,
    created_at: new Date('2024-01-18').toISOString(),
    updated_at: new Date('2024-01-19').toISOString(),
    created_by: 'demo-user-id',
    priority: 'medium',
    expected_close_date: '2024-07-18',
    treatment_start_date: '2024-01-19',
    tags: ['Chronic Pain', 'Diabetes', 'Shoulder', 'Medicare'],
    referral_source: 'Miami Diabetes Center'
  },
  {
    id: '5',
    name: 'Postpartum Care - Amanda Wilson',
    description: 'Postpartum musculoskeletal dysfunction with diastasis recti and pelvic floor issues',
    patient_name: 'Amanda Wilson',
    patient_id: '5',
    patient_email: 'amanda.wilson@email.com',
    patient_phone: '(555) 567-8901',
    case_type: 'Postpartum',
    source: 'OB/GYN Referral',
    pipeline_stage: 'treatment',
    status: 'active',
    estimated_value: 4200,
    created_at: new Date('2024-01-19').toISOString(),
    updated_at: new Date('2024-01-23').toISOString(),
    created_by: 'demo-user-id',
    priority: 'medium',
    expected_close_date: '2024-04-19',
    treatment_start_date: '2024-01-23',
    tags: ['Postpartum', 'Women\'s Health', 'Pelvic Floor'],
    referral_source: 'Women\'s Health Center'
  },
  {
    id: '6',
    name: 'New PIP Case - David Chen',
    description: 'Recent MVA with potential back and neck injuries, attorney referred',
    patient_name: 'David Chen',
    patient_id: 'new-1',
    patient_email: 'david.chen@email.com',
    patient_phone: '(555) 678-9012',
    case_type: 'PIP',
    source: 'Attorney Referral',
    pipeline_stage: 'lead',
    status: 'pending',
    estimated_value: 18000,
    created_at: new Date('2024-01-23').toISOString(),
    updated_at: new Date('2024-01-23').toISOString(),
    created_by: 'demo-user-id',
    priority: 'high',
    expected_close_date: '2024-06-23',
    treatment_start_date: null,
    tags: ['PIP', 'MVA', 'New Patient', 'Attorney-Referred'],
    attorney_name: 'Johnson & Associates',
    attorney_contact: '(555) 999-0001',
    referral_source: 'Attorney Referral'
  },
  {
    id: '7',
    name: 'Cash Patient - Sarah Kim',
    description: 'Self-pay patient seeking treatment for chronic headaches and neck tension',
    patient_name: 'Sarah Kim',
    patient_id: 'new-2',
    patient_email: 'sarah.kim@email.com',
    patient_phone: '(555) 789-0123',
    case_type: 'Cash Plan',
    source: 'Web Form',
    pipeline_stage: 'consultation',
    status: 'active',
    estimated_value: 2800,
    created_at: new Date('2024-01-23').toISOString(),
    updated_at: new Date('2024-01-23').toISOString(),
    created_by: 'demo-user-id',
    priority: 'medium',
    expected_close_date: '2024-04-23',
    treatment_start_date: null,
    tags: ['Cash', 'Headaches', 'Self-Pay'],
    referral_source: 'Google Search'
  }
];

// Enhanced demo stats for realistic dashboard metrics
const mockDashboardStats = {
  totalPatients: 156,
  activePatients: 89,
  totalAppointments: 48,
  todayAppointments: 8,
  totalRevenue: 142350,
  monthlyRevenue: 28470,
  conversionRate: 33,
  leadsThisMonth: 73,
  pipelineValue: 67000,
  avgDealSize: 9571,
  completedCases: 45,
  activeCases: 7
};

// Provider information for demo
const mockProviders = [
  {
    id: 'provider-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Chiropractic Medicine',
    license: 'DC-FL-12345',
    email: 'sarah.johnson@clinic.com',
    phone: '(555) 100-0001'
  },
  {
    id: 'provider-2', 
    name: 'Dr. Michael Chen',
    specialty: 'Chiropractic Medicine',
    license: 'DC-FL-67890',
    email: 'michael.chen@clinic.com',
    phone: '(555) 100-0002'
  },
  {
    id: 'provider-3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pain Management',
    license: 'MD-FL-11111',
    email: 'emily.rodriguez@clinic.com',
    phone: '(555) 100-0003'
  },
  {
    id: 'provider-4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgery',
    license: 'MD-FL-22222',
    email: 'james.wilson@clinic.com', 
    phone: '(555) 100-0004'
  },
  {
    id: 'provider-5',
    name: 'Lisa Thompson, PT',
    specialty: 'Physical Therapy',
    license: 'PT-FL-33333',
    email: 'lisa.thompson@clinic.com',
    phone: '(555) 100-0005'
  },
  {
    id: 'provider-6',
    name: 'Mark Johnson, PT',
    specialty: 'Physical Therapy',
    license: 'PT-FL-44444',
    email: 'mark.johnson@clinic.com',
    phone: '(555) 100-0006'
  }
];

export const useDemoData = () => {
  const { profile } = useProfile();
  const isDemoUser = profile?.role === 'demo';

  return {
    isDemoUser,
    mockPatients: isDemoUser ? mockPatients : [],
    mockOpportunities: isDemoUser ? mockOpportunities : [],
    mockAppointments: isDemoUser ? mockAppointments : [],
    mockSOAPNotes: isDemoUser ? mockSOAPNotes : [],
    mockConversations: isDemoUser ? mockConversations : [],
    mockDocuments: isDemoUser ? mockDocuments : [],
    mockInvoices: isDemoUser ? mockInvoices : [],
    mockNotifications: isDemoUser ? mockNotifications : [],
    mockProviders: isDemoUser ? mockProviders : [],
    mockDashboardStats: isDemoUser ? mockDashboardStats : null
  };
};

export const useIsDemoUser = () => {
  const { profile } = useProfile();
  return profile?.role === 'demo';
};