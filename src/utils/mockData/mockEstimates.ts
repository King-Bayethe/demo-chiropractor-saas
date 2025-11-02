export interface Estimate {
  id: string;
  estimateNumber: string;
  patientId: string;
  patientName: string;
  treatmentType: string;
  phases: Array<{
    id: string;
    name: string;
    description: string;
    sessions: number;
    pricePerSession: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  dateCreated: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
}

export const mockEstimates: Estimate[] = [
  {
    id: '1',
    estimateNumber: 'EST-2024-001',
    patientId: 'p1',
    patientName: 'John Smith',
    treatmentType: 'Comprehensive Chiropractic Care',
    phases: [
      {
        id: 'ph1',
        name: 'Phase 1: Initial Relief',
        description: 'Intensive care to reduce acute pain',
        sessions: 12,
        pricePerSession: 85,
        total: 1020
      },
      {
        id: 'ph2',
        name: 'Phase 2: Corrective Care',
        description: 'Address underlying spinal misalignments',
        sessions: 24,
        pricePerSession: 75,
        total: 1800
      },
      {
        id: 'ph3',
        name: 'Phase 3: Maintenance',
        description: 'Ongoing wellness and prevention',
        sessions: 12,
        pricePerSession: 65,
        total: 780
      }
    ],
    subtotal: 3600,
    discount: 360,
    total: 3240,
    dateCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    notes: '10% discount for pre-payment of full treatment plan'
  },
  {
    id: '2',
    estimateNumber: 'EST-2024-002',
    patientId: 'p2',
    patientName: 'Sarah Johnson',
    treatmentType: 'Physical Therapy Program',
    phases: [
      {
        id: 'ph4',
        name: 'Phase 1: Assessment & Initial Treatment',
        description: 'Comprehensive evaluation and initial therapy sessions',
        sessions: 6,
        pricePerSession: 120,
        total: 720
      },
      {
        id: 'ph5',
        name: 'Phase 2: Active Rehabilitation',
        description: 'Strengthening and mobility exercises',
        sessions: 18,
        pricePerSession: 95,
        total: 1710
      }
    ],
    subtotal: 2430,
    discount: 0,
    total: 2430,
    dateCreated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted'
  },
  {
    id: '3',
    estimateNumber: 'EST-2024-003',
    patientId: 'p3',
    patientName: 'Michael Chen',
    treatmentType: 'Sports Injury Recovery',
    phases: [
      {
        id: 'ph6',
        name: 'Phase 1: Acute Care',
        description: 'Immediate injury management',
        sessions: 8,
        pricePerSession: 110,
        total: 880
      },
      {
        id: 'ph7',
        name: 'Phase 2: Recovery & Strengthening',
        description: 'Progressive rehabilitation program',
        sessions: 16,
        pricePerSession: 100,
        total: 1600
      },
      {
        id: 'ph8',
        name: 'Phase 3: Return to Sport',
        description: 'Sport-specific training and conditioning',
        sessions: 10,
        pricePerSession: 95,
        total: 950
      }
    ],
    subtotal: 3430,
    discount: 515,
    total: 2915,
    dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    notes: '15% discount for athletes with valid competition schedule'
  },
  {
    id: '4',
    estimateNumber: 'EST-2024-004',
    patientId: 'p4',
    patientName: 'Emily Rodriguez',
    treatmentType: 'Wellness & Prevention Program',
    phases: [
      {
        id: 'ph9',
        name: 'Monthly Wellness Visits',
        description: 'Regular maintenance adjustments',
        sessions: 12,
        pricePerSession: 65,
        total: 780
      }
    ],
    subtotal: 780,
    discount: 0,
    total: 780,
    dateCreated: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft'
  },
  {
    id: '5',
    estimateNumber: 'EST-2024-005',
    patientId: 'p5',
    patientName: 'David Williams',
    treatmentType: 'Chronic Pain Management',
    phases: [
      {
        id: 'ph10',
        name: 'Phase 1: Pain Assessment',
        description: 'Comprehensive pain evaluation',
        sessions: 3,
        pricePerSession: 150,
        total: 450
      },
      {
        id: 'ph11',
        name: 'Phase 2: Treatment Protocol',
        description: 'Multi-modal pain management approach',
        sessions: 20,
        pricePerSession: 125,
        total: 2500
      }
    ],
    subtotal: 2950,
    discount: 295,
    total: 2655,
    dateCreated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
    notes: '10% early payment discount applied'
  }
];
