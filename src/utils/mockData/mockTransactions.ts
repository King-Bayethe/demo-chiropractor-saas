export interface Transaction {
  id: string;
  transactionNumber: string;
  patientId: string;
  patientName: string;
  type: 'payment' | 'refund' | 'adjustment' | 'fee';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'check' | 'ach' | 'insurance';
  paymentDetails?: {
    cardLast4?: string;
    checkNumber?: string;
    authCode?: string;
  };
  invoiceId?: string;
  date: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'voided';
  processedBy: string;
  notes?: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionNumber: 'TXN-2024-0001',
    patientId: 'p1',
    patientName: 'John Smith',
    type: 'payment',
    description: 'Payment for Invoice INV-2024-001',
    amount: 712.80,
    paymentMethod: 'credit_card',
    paymentDetails: { cardLast4: '4242', authCode: 'AUTH123456' },
    invoiceId: '1',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez'
  },
  {
    id: '2',
    transactionNumber: 'TXN-2024-0002',
    patientId: 'p2',
    patientName: 'Sarah Johnson',
    type: 'payment',
    description: 'Weekly PT Session Payment',
    amount: 95.00,
    paymentMethod: 'debit_card',
    paymentDetails: { cardLast4: '5678', authCode: 'AUTH234567' },
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'James Wilson'
  },
  {
    id: '3',
    transactionNumber: 'TXN-2024-0003',
    patientId: 'p3',
    patientName: 'Michael Chen',
    type: 'payment',
    description: 'Comprehensive Examination Payment',
    amount: 950.40,
    paymentMethod: 'insurance',
    invoiceId: '3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez',
    notes: 'Insurance claim processed'
  },
  {
    id: '4',
    transactionNumber: 'TXN-2024-0004',
    patientId: 'p4',
    patientName: 'Emily Rodriguez',
    type: 'payment',
    description: 'Wellness Membership - Monthly',
    amount: 65.00,
    paymentMethod: 'credit_card',
    paymentDetails: { cardLast4: '9012', authCode: 'AUTH345678' },
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'James Wilson'
  },
  {
    id: '5',
    transactionNumber: 'TXN-2024-0005',
    patientId: 'p5',
    patientName: 'David Williams',
    type: 'payment',
    description: 'Pain Management Session',
    amount: 175.00,
    paymentMethod: 'cash',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez'
  },
  {
    id: '6',
    transactionNumber: 'TXN-2024-0006',
    patientId: 'p1',
    patientName: 'John Smith',
    type: 'refund',
    description: 'Refund for cancelled appointment',
    amount: -85.00,
    paymentMethod: 'credit_card',
    paymentDetails: { cardLast4: '4242' },
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'James Wilson',
    notes: 'Appointment cancelled due to emergency'
  },
  {
    id: '7',
    transactionNumber: 'TXN-2024-0007',
    patientId: 'p6',
    patientName: 'Lisa Anderson',
    type: 'payment',
    description: 'Chiropractic Adjustment',
    amount: 85.00,
    paymentMethod: 'check',
    paymentDetails: { checkNumber: '1234' },
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez'
  },
  {
    id: '8',
    transactionNumber: 'TXN-2024-0008',
    patientId: 'p2',
    patientName: 'Sarah Johnson',
    type: 'payment',
    description: 'Physical Therapy Package (5 sessions)',
    amount: 475.00,
    paymentMethod: 'ach',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'James Wilson'
  },
  {
    id: '9',
    transactionNumber: 'TXN-2024-0009',
    patientId: 'p3',
    patientName: 'Michael Chen',
    type: 'adjustment',
    description: 'Insurance adjustment - Write-off',
    amount: -50.00,
    paymentMethod: 'insurance',
    invoiceId: '3',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez',
    notes: 'Contractual adjustment per insurance agreement'
  },
  {
    id: '10',
    transactionNumber: 'TXN-2024-0010',
    patientId: 'p7',
    patientName: 'Robert Taylor',
    type: 'payment',
    description: 'Initial Consultation',
    amount: 150.00,
    paymentMethod: 'credit_card',
    paymentDetails: { cardLast4: '7890', authCode: 'AUTH456789' },
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'James Wilson'
  },
  {
    id: '11',
    transactionNumber: 'TXN-2024-0011',
    patientId: 'p5',
    patientName: 'David Williams',
    type: 'payment',
    description: 'Pain Management Program - Monthly',
    amount: 265.00,
    paymentMethod: 'credit_card',
    paymentDetails: { cardLast4: '3456' },
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    processedBy: 'James Wilson',
    notes: 'Card declined - insufficient funds'
  },
  {
    id: '12',
    transactionNumber: 'TXN-2024-0012',
    patientId: 'p8',
    patientName: 'Jennifer Martinez',
    type: 'fee',
    description: 'Late payment fee',
    amount: 25.00,
    paymentMethod: 'credit_card',
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    processedBy: 'Lisa Martinez',
    notes: 'Applied to overdue invoice'
  }
];
