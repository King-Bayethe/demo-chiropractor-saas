export interface MockInvoice {
  id: string;
  patient_id: string;
  patient_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  payment_date?: string;
  services: {
    date: string;
    description: string;
    code: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  insurance_info?: {
    provider: string;
    policy_number: string;
    claim_number?: string;
    authorization_number?: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

export const mockInvoices: MockInvoice[] = [
  {
    id: "inv-1",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    invoice_number: "INV-2024-001",
    issue_date: "2024-01-22",
    due_date: "2024-02-21",
    amount: 450.00,
    amount_paid: 450.00,
    amount_due: 0.00,
    status: "paid",
    payment_method: "Insurance",
    payment_date: "2024-01-25",
    services: [
      {
        date: "2024-01-22",
        description: "Initial Consultation and Examination",
        code: "99213",
        quantity: 1,
        rate: 150.00,
        amount: 150.00
      },
      {
        date: "2024-01-22", 
        description: "Lumbar Spine X-Ray (2 views)",
        code: "72100",
        quantity: 1,
        rate: 120.00,
        amount: 120.00
      },
      {
        date: "2024-01-22",
        description: "Physical Therapy Evaluation",
        code: "97161",
        quantity: 1,
        rate: 180.00,
        amount: 180.00
      }
    ],
    insurance_info: {
      provider: "Blue Cross Blue Shield",
      policy_number: "BC123456789",
      claim_number: "CLM-2024-001",
      authorization_number: "AUTH-789456"
    },
    notes: "PIP case - Motor vehicle accident. All charges covered under PIP benefits.",
    created_at: "2024-01-22T17:00:00Z",
    updated_at: "2024-01-25T10:30:00Z"
  },
  {
    id: "inv-2",
    patient_id: "2",
    patient_name: "James Thompson",
    invoice_number: "INV-2024-002",
    issue_date: "2024-01-20",
    due_date: "2024-02-19",
    amount: 380.00,
    amount_paid: 380.00,
    amount_due: 0.00,
    status: "paid",
    payment_method: "Workers Compensation",
    payment_date: "2024-01-28",
    services: [
      {
        date: "2024-01-20",
        description: "Chiropractic Manipulation - Cervical",
        code: "98940",
        quantity: 1,
        rate: 85.00,
        amount: 85.00
      },
      {
        date: "2024-01-20",
        description: "Therapeutic Massage - 30 minutes",
        code: "97124",
        quantity: 1,
        rate: 95.00,
        amount: 95.00
      },
      {
        date: "2024-01-20",
        description: "Cervical Spine X-Ray (3 views)",
        code: "72040",
        quantity: 1,
        rate: 200.00,
        amount: 200.00
      }
    ],
    insurance_info: {
      provider: "Aetna Workers Compensation",
      policy_number: "AET987654321",
      claim_number: "WC-2024-002",
      authorization_number: "WC-AUTH-456789"
    },
    notes: "Workers compensation case - Construction workplace injury. Approved for ongoing treatment.",
    created_at: "2024-01-20T18:15:00Z",
    updated_at: "2024-01-28T14:45:00Z"
  },
  {
    id: "inv-3",
    patient_id: "3",
    patient_name: "Linda Davis",
    invoice_number: "INV-2024-003",
    issue_date: "2024-01-21",
    due_date: "2024-02-20",
    amount: 650.00,
    amount_paid: 195.00,
    amount_due: 455.00,
    status: "sent",
    services: [
      {
        date: "2024-01-21",
        description: "Emergency Consultation - Acute Knee Injury",
        code: "99214",
        quantity: 1,
        rate: 200.00,
        amount: 200.00
      },
      {
        date: "2024-01-21",
        description: "Knee Joint Aspiration",
        code: "20610",
        quantity: 1,
        rate: 150.00,
        amount: 150.00
      },
      {
        date: "2024-01-21",
        description: "MRI Knee with Contrast",
        code: "73721",
        quantity: 1,
        rate: 300.00,
        amount: 300.00
      }
    ],
    insurance_info: {
      provider: "United Healthcare",
      policy_number: "UHC456789123",
      claim_number: "CLM-2024-003"
    },
    notes: "Sports injury - Soccer. Partial coverage, patient responsible for deductible.",
    created_at: "2024-01-21T19:30:00Z",
    updated_at: "2024-01-21T19:30:00Z"
  },
  {
    id: "inv-4",
    patient_id: "4",
    patient_name: "Robert Martinez",
    invoice_number: "INV-2024-004",
    issue_date: "2024-01-19",
    due_date: "2024-02-18",
    amount: 525.00,
    amount_paid: 420.00,
    amount_due: 105.00,
    status: "sent",
    services: [
      {
        date: "2024-01-19",
        description: "Chronic Pain Management Consultation",
        code: "99213",
        quantity: 1,
        rate: 175.00,
        amount: 175.00
      },
      {
        date: "2024-01-19",
        description: "Corticosteroid Injection - Shoulder",
        code: "20610",
        quantity: 1,
        rate: 200.00,
        amount: 200.00
      },
      {
        date: "2024-01-19",
        description: "Physical Therapy Session",
        code: "97110",
        quantity: 1,
        rate: 150.00,
        amount: 150.00
      }
    ],
    insurance_info: {
      provider: "Medicare",
      policy_number: "MCARE123456789"
    },
    notes: "Medicare patient with supplemental coverage. Copay collected.",
    created_at: "2024-01-19T16:00:00Z",
    updated_at: "2024-01-23T11:20:00Z"
  },
  {
    id: "inv-5",
    patient_id: "5",
    patient_name: "Amanda Wilson",
    invoice_number: "INV-2024-005",
    issue_date: "2024-01-23",
    due_date: "2024-02-22",
    amount: 320.00,
    amount_paid: 64.00,
    amount_due: 256.00,
    status: "sent",
    services: [
      {
        date: "2024-01-23",
        description: "Postpartum Musculoskeletal Evaluation",
        code: "99213",
        quantity: 1,
        rate: 140.00,
        amount: 140.00
      },
      {
        date: "2024-01-23",
        description: "Pelvic Floor Physical Therapy",
        code: "97110",
        quantity: 1,
        rate: 180.00,
        amount: 180.00
      }
    ],
    insurance_info: {
      provider: "Cigna",
      policy_number: "CIG789012345"
    },
    notes: "Postpartum care - 20% coinsurance applied after deductible.",
    created_at: "2024-01-23T17:45:00Z",
    updated_at: "2024-01-23T17:45:00Z"
  },
  {
    id: "inv-6",
    patient_id: "new-2",
    patient_name: "Sarah Kim",
    invoice_number: "INV-2024-006",
    issue_date: today.toISOString().split('T')[0],
    due_date: nextMonth.toISOString().split('T')[0],
    amount: 275.00,
    amount_paid: 0.00,
    amount_due: 275.00,
    status: "draft",
    services: [
      {
        date: today.toISOString().split('T')[0],
        description: "New Patient Cash Consultation",
        code: "99203",
        quantity: 1,
        rate: 175.00,
        amount: 175.00
      },
      {
        date: today.toISOString().split('T')[0],
        description: "Headache Assessment and Treatment Plan",
        code: "G43.909",
        quantity: 1,
        rate: 100.00,
        amount: 100.00
      }
    ],
    notes: "Cash patient - 20% discount applied for upfront payment.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "inv-7",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    invoice_number: "INV-2024-007",
    issue_date: "2024-01-25",
    due_date: "2024-02-24",
    amount: 285.00,
    amount_paid: 0.00,
    amount_due: 285.00,
    status: "sent",
    services: [
      {
        date: "2024-01-25",
        description: "Follow-up Physical Therapy Session",
        code: "97110",
        quantity: 1,
        rate: 135.00,
        amount: 135.00
      },
      {
        date: "2024-01-25",
        description: "Therapeutic Exercise",
        code: "97110",
        quantity: 1,
        rate: 150.00,
        amount: 150.00
      }
    ],
    insurance_info: {
      provider: "Blue Cross Blue Shield",
      policy_number: "BC123456789",
      claim_number: "CLM-2024-007"
    },
    notes: "Continuing PIP benefits - Ongoing treatment authorization approved.",
    created_at: "2024-01-25T20:00:00Z",
    updated_at: "2024-01-25T20:00:00Z"
  },
  {
    id: "inv-8",
    patient_id: "2",
    patient_name: "James Thompson",
    invoice_number: "INV-2024-008",
    issue_date: lastMonth.toISOString().split('T')[0],
    due_date: today.toISOString().split('T')[0],
    amount: 315.00,
    amount_paid: 0.00,
    amount_due: 315.00,
    status: "overdue",
    services: [
      {
        date: lastMonth.toISOString().split('T')[0],
        description: "Chiropractic Follow-up Treatment",
        code: "98941",
        quantity: 1,
        rate: 90.00,
        amount: 90.00
      },
      {
        date: lastMonth.toISOString().split('T')[0],
        description: "Cervical Decompression Therapy",
        code: "97012",
        quantity: 1,
        rate: 125.00,
        amount: 125.00
      },
      {
        date: lastMonth.toISOString().split('T')[0],
        description: "Therapeutic Ultrasound",
        code: "97035",
        quantity: 1,
        rate: 100.00,
        amount: 100.00
      }
    ],
    insurance_info: {
      provider: "Aetna Workers Compensation",
      policy_number: "AET987654321",
      claim_number: "WC-2024-008"
    },
    notes: "OVERDUE - Workers comp claim under review. Payment pending approval.",
    created_at: lastMonth.toISOString(),
    updated_at: new Date().toISOString()
  }
];