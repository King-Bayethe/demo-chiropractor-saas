export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  dateIssued: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    patientId: 'p1',
    patientName: 'John Smith',
    patientEmail: 'john.smith@email.com',
    lineItems: [
      { id: 'li1', description: 'Initial Consultation', quantity: 1, unitPrice: 150, total: 150 },
      { id: 'li2', description: 'X-Ray Imaging', quantity: 2, unitPrice: 75, total: 150 },
      { id: 'li3', description: 'Treatment Session', quantity: 3, unitPrice: 120, total: 360 }
    ],
    subtotal: 660,
    taxRate: 0.08,
    taxAmount: 52.80,
    total: 712.80,
    dateIssued: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'overdue',
    notes: 'Payment plan available upon request'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    patientId: 'p2',
    patientName: 'Sarah Johnson',
    patientEmail: 'sarah.j@email.com',
    lineItems: [
      { id: 'li4', description: 'Follow-up Consultation', quantity: 1, unitPrice: 100, total: 100 },
      { id: 'li5', description: 'Physical Therapy Session', quantity: 5, unitPrice: 95, total: 475 }
    ],
    subtotal: 575,
    taxRate: 0.08,
    taxAmount: 46,
    total: 621,
    dateIssued: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    patientId: 'p3',
    patientName: 'Michael Chen',
    patientEmail: 'mchen@email.com',
    lineItems: [
      { id: 'li6', description: 'Comprehensive Examination', quantity: 1, unitPrice: 200, total: 200 },
      { id: 'li7', description: 'MRI Scan', quantity: 1, unitPrice: 500, total: 500 },
      { id: 'li8', description: 'Specialist Consultation', quantity: 1, unitPrice: 180, total: 180 }
    ],
    subtotal: 880,
    taxRate: 0.08,
    taxAmount: 70.40,
    total: 950.40,
    dateIssued: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    patientId: 'p4',
    patientName: 'Emily Rodriguez',
    patientEmail: 'emily.r@email.com',
    lineItems: [
      { id: 'li9', description: 'Chiropractic Adjustment', quantity: 4, unitPrice: 85, total: 340 }
    ],
    subtotal: 340,
    taxRate: 0.08,
    taxAmount: 27.20,
    total: 367.20,
    dateIssued: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    patientId: 'p5',
    patientName: 'David Williams',
    patientEmail: 'dwilliams@email.com',
    lineItems: [
      { id: 'li10', description: 'Pain Management Consultation', quantity: 1, unitPrice: 175, total: 175 },
      { id: 'li11', description: 'Therapeutic Exercise Program', quantity: 1, unitPrice: 250, total: 250 }
    ],
    subtotal: 425,
    taxRate: 0.08,
    taxAmount: 34,
    total: 459,
    dateIssued: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft'
  }
];
