import { useProfile } from './useProfile';
import { mockPatients } from '@/data/mockPatients';
import { useState, useEffect } from 'react';

// Mock opportunities data for demo users
const mockOpportunities = [
  {
    id: '1',
    name: 'PIP Case - John Doe MVA',
    description: 'Motor vehicle accident case with potential for comprehensive treatment',
    patient_name: 'John Doe',
    patient_email: 'john.doe@email.com',
    patient_phone: '(555) 123-4567',
    case_type: 'PIP',
    source: 'PIP Form',
    pipeline_stage: 'consultation',
    status: 'active',
    estimated_value: 15000,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
    created_by: 'demo-user-id',
    priority: 'high',
    expected_close_date: '2024-03-15',
    treatment_start_date: '2024-02-01',
    tags: ['PIP', 'MVA', 'High-Priority']
  },
  {
    id: '2',
    name: 'Cash Patient - Sarah Wilson',
    description: 'Self-pay patient seeking chiropractic care for chronic back pain',
    patient_name: 'Sarah Wilson',
    patient_email: 'sarah.wilson@email.com',
    patient_phone: '(555) 234-5678',
    case_type: 'Cash Plan',
    source: 'Cash Form',
    pipeline_stage: 'treatment',
    status: 'active',
    estimated_value: 3000,
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
    created_by: 'demo-user-id',
    priority: 'medium',
    expected_close_date: '2024-04-10',
    treatment_start_date: '2024-01-20',
    tags: ['Cash', 'Chronic-Pain']
  },
  {
    id: '3',
    name: 'LOP Case - Michael Johnson',
    description: 'Attorney referred case for injury treatment and documentation',
    patient_name: 'Michael Johnson',
    patient_email: 'michael.johnson@email.com',
    patient_phone: '(555) 345-6789',
    case_type: 'Attorney Only',
    source: 'LOP Form',
    pipeline_stage: 'lead',
    status: 'pending',
    estimated_value: 8500,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
    created_by: 'demo-user-id',
    priority: 'high',
    expected_close_date: '2024-05-20',
    attorney_name: 'Smith & Associates',
    attorney_contact: '(555) 999-0000',
    tags: ['LOP', 'Attorney-Referred']
  }
];

// Mock appointments data for demo users
const mockAppointments = [
  {
    id: '1',
    title: 'Initial Consultation - John Doe',
    patient_name: 'John Doe',
    patient_email: 'john.doe@email.com',
    patient_phone: '(555) 123-4567',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
    status: 'scheduled',
    appointment_type: 'Initial Consultation',
    provider_name: 'Dr. Demo',
    description: 'Initial evaluation for PIP case',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Follow-up Treatment - Sarah Wilson',
    patient_name: 'Sarah Wilson',
    patient_email: 'sarah.wilson@email.com',
    patient_phone: '(555) 234-5678',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Day after tomorrow + 30 min
    status: 'scheduled',
    appointment_type: 'Treatment',
    provider_name: 'Dr. Demo',
    description: 'Continuing care for chronic back pain',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useDemoData = () => {
  const { profile } = useProfile();
  const isDemoUser = profile?.role === 'demo';

  return {
    isDemoUser,
    mockPatients: isDemoUser ? mockPatients : [],
    mockOpportunities: isDemoUser ? mockOpportunities : [],
    mockAppointments: isDemoUser ? mockAppointments : []
  };
};

export const useIsDemoUser = () => {
  const { profile } = useProfile();
  return profile?.role === 'demo';
};