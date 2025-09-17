export interface MockDocument {
  id: string;
  patient_id: string;
  patient_name: string;
  name: string;
  file_type: string;
  file_size: number;
  category: string;
  description: string;
  file_path: string;
  uploaded_by: string;
  uploaded_by_name: string;
  status: 'active' | 'archived' | 'pending_review';
  created_at: string;
  updated_at: string;
  tags?: string[];
  referral_source?: string;
}

export const mockDocuments: MockDocument[] = [
  {
    id: "doc-1",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    name: "MRI Lumbar Spine Report",
    file_type: "PDF",
    file_size: 2048000, // 2MB
    category: "Medical Imaging",
    description: "L4-L5 disc herniation with nerve root compression",
    file_path: "/documents/mri-lumbar-maria-rodriguez.pdf",
    uploaded_by: "provider-1",
    uploaded_by_name: "Dr. Sarah Johnson",
    status: "active",
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-10T14:30:00Z",
    tags: ["MRI", "Lumbar", "Disc Herniation"],
    referral_source: "Miami Imaging Center"
  },
  {
    id: "doc-2",
    patient_id: "1", 
    patient_name: "Maria Rodriguez",
    name: "PIP Insurance Card",
    file_type: "JPG",
    file_size: 512000, // 512KB
    category: "Insurance",
    description: "Blue Cross Blue Shield PIP coverage documentation",
    file_path: "/documents/insurance-card-maria-rodriguez.jpg",
    uploaded_by: "staff-1",
    uploaded_by_name: "Jennifer Adams, Front Desk",
    status: "active",
    created_at: "2024-01-15T09:15:00Z",
    updated_at: "2024-01-15T09:15:00Z",
    tags: ["PIP", "Insurance", "Blue Cross"],
    referral_source: "Patient Upload"
  },
  {
    id: "doc-3",
    patient_id: "1",
    patient_name: "Maria Rodriguez", 
    name: "Physical Therapy Evaluation",
    file_type: "PDF",
    file_size: 1024000, // 1MB
    category: "Treatment Notes",
    description: "Initial PT evaluation and treatment plan",
    file_path: "/documents/pt-eval-maria-rodriguez.pdf",
    uploaded_by: "provider-6",
    uploaded_by_name: "Mark Johnson, PT",
    status: "active",
    created_at: "2024-01-18T11:00:00Z",
    updated_at: "2024-01-18T11:00:00Z",
    tags: ["Physical Therapy", "Evaluation", "Treatment Plan"],
    referral_source: "Internal"
  },
  {
    id: "doc-4",
    patient_id: "2",
    patient_name: "James Thompson",
    name: "X-ray Cervical Spine",
    file_type: "DICOM",
    file_size: 15360000, // 15MB
    category: "Medical Imaging", 
    description: "Loss of cervical lordosis, mild degenerative changes C5-C6",
    file_path: "/documents/xray-cervical-james-thompson.dcm",
    uploaded_by: "provider-2",
    uploaded_by_name: "Dr. Michael Chen",
    status: "active",
    created_at: "2024-01-12T16:45:00Z",
    updated_at: "2024-01-12T16:45:00Z",
    tags: ["X-ray", "Cervical", "Degenerative Changes"],
    referral_source: "Fort Lauderdale Radiology"
  },
  {
    id: "doc-5",
    patient_id: "2",
    patient_name: "James Thompson",
    name: "Workers Compensation Claim Form",
    file_type: "PDF", 
    file_size: 768000, // 768KB
    category: "Legal",
    description: "WC claim form for workplace neck injury",
    file_path: "/documents/wc-claim-james-thompson.pdf",
    uploaded_by: "staff-2",
    uploaded_by_name: "Michael Torres, Claims Specialist",
    status: "active",
    created_at: "2024-01-16T13:20:00Z",
    updated_at: "2024-01-16T13:20:00Z",
    tags: ["Workers Comp", "Claim Form", "Legal"],
    referral_source: "Employer - ABC Construction"
  },
  {
    id: "doc-6",
    patient_id: "3",
    patient_name: "Linda Davis",
    name: "MRI Right Knee Report",
    file_type: "PDF",
    file_size: 1536000, // 1.5MB
    category: "Medical Imaging",
    description: "Medial meniscus tear, Grade 2 MCL sprain",
    file_path: "/documents/mri-knee-linda-davis.pdf",
    uploaded_by: "provider-4",
    uploaded_by_name: "Dr. James Wilson",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    tags: ["MRI", "Knee", "Meniscus Tear", "MCL Sprain"],
    referral_source: "Sports Medicine Imaging"
  },
  {
    id: "doc-7",
    patient_id: "3", 
    patient_name: "Linda Davis",
    name: "Surgical Consent Form",
    file_type: "PDF",
    file_size: 256000, // 256KB
    category: "Legal",
    description: "Informed consent for arthroscopic meniscus repair",
    file_path: "/documents/surgical-consent-linda-davis.pdf",
    uploaded_by: "provider-4",
    uploaded_by_name: "Dr. James Wilson",
    status: "active",
    created_at: "2024-01-17T08:00:00Z",
    updated_at: "2024-01-17T08:00:00Z",
    tags: ["Surgery", "Consent", "Arthroscopy"],
    referral_source: "Internal"
  },
  {
    id: "doc-8",
    patient_id: "4",
    patient_name: "Robert Martinez",
    name: "Diabetes Management Letter",
    file_type: "PDF",
    file_size: 384000, // 384KB
    category: "Medical Records",
    description: "Endocrinologist clearance for steroid injection",
    file_path: "/documents/diabetes-clearance-robert-martinez.pdf",
    uploaded_by: "provider-3",
    uploaded_by_name: "Dr. Emily Rodriguez", 
    status: "active",
    created_at: "2024-01-18T15:45:00Z",
    updated_at: "2024-01-18T15:45:00Z",
    tags: ["Diabetes", "Clearance", "Endocrinology"],
    referral_source: "Miami Diabetes Center"
  },
  {
    id: "doc-9",
    patient_id: "4",
    patient_name: "Robert Martinez",
    name: "Shoulder MRI Report",
    file_type: "PDF",
    file_size: 1792000, // 1.75MB
    category: "Medical Imaging",
    description: "Partial thickness rotator cuff tear, subacromial bursitis",
    file_path: "/documents/mri-shoulder-robert-martinez.pdf",
    uploaded_by: "provider-3",
    uploaded_by_name: "Dr. Emily Rodriguez",
    status: "active",
    created_at: "2024-01-14T12:00:00Z",
    updated_at: "2024-01-14T12:00:00Z",
    tags: ["MRI", "Shoulder", "Rotator Cuff", "Bursitis"],
    referral_source: "Advanced Imaging LLC"
  },
  {
    id: "doc-10",
    patient_id: "5",
    patient_name: "Amanda Wilson",
    name: "Postpartum Exercise Plan",
    file_type: "PDF",
    file_size: 640000, // 640KB
    category: "Treatment Plans",
    description: "Customized exercise protocol for postpartum recovery",
    file_path: "/documents/exercise-plan-amanda-wilson.pdf",
    uploaded_by: "provider-5",
    uploaded_by_name: "Lisa Thompson, PT",
    status: "active",
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    tags: ["Postpartum", "Exercise", "Core Strengthening"],
    referral_source: "Internal"
  },
  {
    id: "doc-11",
    patient_id: "5",
    patient_name: "Amanda Wilson",
    name: "Pelvic Floor Assessment",
    file_type: "PDF",
    file_size: 896000, // 896KB
    category: "Assessment Reports",
    description: "Comprehensive pelvic floor evaluation and recommendations",
    file_path: "/documents/pelvic-floor-amanda-wilson.pdf",
    uploaded_by: "provider-5",
    uploaded_by_name: "Lisa Thompson, PT",
    status: "active",
    created_at: "2024-01-19T16:30:00Z",
    updated_at: "2024-01-19T16:30:00Z",
    tags: ["Pelvic Floor", "Assessment", "Women's Health"],
    referral_source: "Internal"
  },
  {
    id: "doc-12",
    patient_id: "new-1",
    patient_name: "David Chen",
    name: "Attorney Referral Letter",
    file_type: "PDF",
    file_size: 320000, // 320KB
    category: "Legal",
    description: "Referral from Attorney Johnson for MVA evaluation",
    file_path: "/documents/attorney-referral-david-chen.pdf",
    uploaded_by: "staff-1",
    uploaded_by_name: "Jennifer Adams, Front Desk",
    status: "pending_review",
    created_at: "2024-01-23T10:15:00Z",
    updated_at: "2024-01-23T10:15:00Z",
    tags: ["Attorney", "Referral", "MVA", "New Patient"],
    referral_source: "Johnson & Associates Law Firm"
  },
  {
    id: "doc-13",
    patient_id: "new-1", 
    patient_name: "David Chen",
    name: "Police Report",
    file_type: "PDF",
    file_size: 1152000, // 1.125MB
    category: "Legal",
    description: "Traffic accident report documenting vehicle collision",
    file_path: "/documents/police-report-david-chen.pdf",
    uploaded_by: "staff-2",
    uploaded_by_name: "Michael Torres, Claims Specialist",
    status: "active",
    created_at: "2024-01-23T11:30:00Z",
    updated_at: "2024-01-23T11:30:00Z",
    tags: ["Police Report", "MVA", "Traffic Accident"],
    referral_source: "Miami-Dade Police Department"
  },
  {
    id: "doc-14",
    patient_id: "new-2",
    patient_name: "Sarah Kim",
    name: "Cash Payment Agreement",
    file_type: "PDF",
    file_size: 448000, // 448KB
    category: "Financial",
    description: "Self-pay treatment plan and payment schedule",
    file_path: "/documents/cash-agreement-sarah-kim.pdf",
    uploaded_by: "staff-3",
    uploaded_by_name: "Angela Martinez, Billing",
    status: "active",
    created_at: "2024-01-23T13:45:00Z",
    updated_at: "2024-01-23T13:45:00Z",
    tags: ["Cash Payment", "Self Pay", "Payment Plan"],
    referral_source: "Patient Request"
  }
];