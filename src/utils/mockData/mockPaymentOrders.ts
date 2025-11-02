export interface PaymentOrder {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  customFrequencyDays?: number;
  startDate: string;
  endDate?: string;
  totalPayments?: number;
  paymentsMade: number;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  paymentMethod: string;
  autoProcess: boolean;
  paymentHistory: Array<{
    date: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
  }>;
}

export const mockPaymentOrders: PaymentOrder[] = [
  {
    id: '1',
    patientId: 'p1',
    patientName: 'John Smith',
    description: 'Comprehensive Treatment Plan - Monthly Installment',
    amount: 270,
    frequency: 'monthly',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 12,
    paymentsMade: 3,
    nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    paymentMethod: 'Credit Card ending in 4242',
    autoProcess: true,
    paymentHistory: [
      { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), amount: 270, status: 'success' },
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 270, status: 'success' },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 270, status: 'success' }
    ]
  },
  {
    id: '2',
    patientId: 'p2',
    patientName: 'Sarah Johnson',
    description: 'Physical Therapy Sessions - Weekly',
    amount: 95,
    frequency: 'weekly',
    startDate: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 24,
    paymentsMade: 8,
    nextPaymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    paymentMethod: 'Debit Card ending in 5678',
    autoProcess: true,
    paymentHistory: [
      { date: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), amount: 95, status: 'success' }
    ]
  },
  {
    id: '3',
    patientId: 'p3',
    patientName: 'Michael Chen',
    description: 'Sports Injury Recovery - Bi-Weekly',
    amount: 200,
    frequency: 'biweekly',
    startDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 12,
    paymentsMade: 3,
    nextPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    paymentMethod: 'ACH Bank Transfer',
    autoProcess: true,
    paymentHistory: [
      { date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(), amount: 200, status: 'success' },
      { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), amount: 200, status: 'success' },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), amount: 200, status: 'success' }
    ]
  },
  {
    id: '4',
    patientId: 'p4',
    patientName: 'Emily Rodriguez',
    description: 'Wellness Membership - Monthly',
    amount: 65,
    frequency: 'monthly',
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    paymentsMade: 6,
    nextPaymentDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    paymentMethod: 'Credit Card ending in 9012',
    autoProcess: true,
    paymentHistory: [
      { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' },
      { date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' },
      { date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' },
      { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' },
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, status: 'success' }
    ]
  },
  {
    id: '5',
    patientId: 'p5',
    patientName: 'David Williams',
    description: 'Pain Management Program - Monthly',
    amount: 265,
    frequency: 'monthly',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 10,
    paymentsMade: 1,
    nextPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    paymentMethod: 'Credit Card ending in 3456',
    autoProcess: true,
    paymentHistory: [
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 265, status: 'success' },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 265, status: 'failed' }
    ]
  },
  {
    id: '6',
    patientId: 'p6',
    patientName: 'Lisa Anderson',
    description: 'Maintenance Care Plan',
    amount: 180,
    frequency: 'monthly',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalPayments: 12,
    paymentsMade: 12,
    lastPaymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextPaymentDate: '',
    status: 'completed',
    paymentMethod: 'ACH Bank Transfer',
    autoProcess: true,
    paymentHistory: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (365 - i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      amount: 180,
      status: 'success' as const
    }))
  }
];
