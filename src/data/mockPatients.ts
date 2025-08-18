export interface MockPatient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  insurance_provider: string;
  insurance_policy_number: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // SOAP data
  soapData: {
    subjective: {
      symptoms: string[];
      painScale: number | null;
      painDescription: string;
      otherSymptoms: string;
      isRefused: boolean;
      isWithinNormalLimits: boolean;
    };
    objective: {
      vitalSigns: {
        height: string;
        weight: string;
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        oxygenSaturation: string;
        respiratoryRate: string;
      };
      systemExams: any[];
      specialTests: any[];
      imagingLabs: any[];
      procedures: any[];
    };
    assessment: {
      diagnoses: any[];
      clinicalImpression: string;
    };
    plan: {
      treatments: any[];
      medications: any[];
      additionalInstructions: string;
      followUpInstructions: string;
      legalTags: string[];
    };
  };
}

export const mockPatients: MockPatient[] = [
  {
    id: "1",
    first_name: "Maria",
    last_name: "Rodriguez",
    email: "maria.rodriguez@email.com",
    phone: "(555) 123-4567",
    date_of_birth: "1985-03-15",
    gender: "Female",
    address: "123 Main St",
    city: "Miami",
    state: "FL",
    zip_code: "33101",
    emergency_contact_name: "Carlos Rodriguez",
    emergency_contact_phone: "(555) 123-4568",
    insurance_provider: "Blue Cross Blue Shield",
    insurance_policy_number: "BC123456789",
    tags: ["PIP Patient", "Active Treatment"],
    is_active: true,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z",
    soapData: {
      subjective: {
        symptoms: ["Lower back pain", "Muscle stiffness", "Limited mobility"],
        painScale: 7,
        painDescription: "Sharp, shooting pain that radiates down left leg. Worse in the morning and after sitting for long periods.",
        otherSymptoms: "Occasional numbness in toes, difficulty sleeping due to pain",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'6\"",
          weight: "145 lbs",
          bloodPressure: "125/80",
          heartRate: "72",
          temperature: "98.6°F",
          oxygenSaturation: "98%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Musculoskeletal", findings: "Decreased lumbar lordosis, tender L4-L5 region" },
          { system: "Neurological", findings: "Positive straight leg raise test on left side" }
        ],
        specialTests: [
          { test: "Straight Leg Raise", result: "Positive at 45 degrees on left side" },
          { test: "Range of Motion", result: "Limited flexion and extension" }
        ],
        imagingLabs: [
          { type: "MRI Lumbar Spine", date: "2024-01-10", results: "L4-L5 disc herniation with nerve root compression" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M51.16", description: "Intervertebral disc disorders with radiculopathy, lumbar region", type: "Primary" },
          { code: "M54.5", description: "Low back pain", type: "Secondary" }
        ],
        clinicalImpression: "34-year-old female with acute L4-L5 disc herniation causing radicular symptoms. Motor vehicle accident related injury requiring comprehensive pain management and physical therapy."
      },
      plan: {
        treatments: [
          { type: "Physical Therapy", frequency: "3x/week for 6 weeks", provider: "Miami Spine Center" },
          { type: "Chiropractic Care", frequency: "2x/week for 4 weeks", provider: "Dr. Silverman" }
        ],
        medications: [
          { name: "Ibuprofen", dosage: "600mg", frequency: "TID with food", duration: "2 weeks" },
          { name: "Cyclobenzaprine", dosage: "10mg", frequency: "QHS", duration: "1 week" }
        ],
        additionalInstructions: "Apply ice packs 15-20 minutes every 2-3 hours for first 48 hours, then alternate with heat therapy. Avoid heavy lifting >10 lbs.",
        followUpInstructions: "Return in 2 weeks for progress evaluation. Contact office if symptoms worsen or new neurological symptoms develop.",
        legalTags: ["PIP", "Motor Vehicle Accident", "Work Injury"]
      }
    }
  },
  {
    id: "2",
    first_name: "James",
    last_name: "Thompson",
    email: "james.thompson@email.com",
    phone: "(555) 234-5678",
    date_of_birth: "1978-11-22",
    gender: "Male",
    address: "456 Oak Avenue",
    city: "Fort Lauderdale",
    state: "FL",
    zip_code: "33301",
    emergency_contact_name: "Sarah Thompson",
    emergency_contact_phone: "(555) 234-5679",
    insurance_provider: "Aetna",
    insurance_policy_number: "AET987654321",
    tags: ["Chronic Pain", "Workers Comp"],
    is_active: true,
    created_at: "2024-01-16T09:30:00Z",
    updated_at: "2024-01-16T09:30:00Z",
    soapData: {
      subjective: {
        symptoms: ["Neck pain", "Headaches", "Shoulder stiffness", "Arm numbness"],
        painScale: 6,
        painDescription: "Constant aching in neck with intermittent sharp pain. Headaches occur 3-4 times per week, primarily occipital region.",
        otherSymptoms: "Difficulty concentrating, sleep disturbances, occasional dizziness",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "6'1\"",
          weight: "185 lbs",
          bloodPressure: "130/85",
          heartRate: "68",
          temperature: "98.4°F",
          oxygenSaturation: "99%",
          respiratoryRate: "14"
        },
        systemExams: [
          { system: "Cervical Spine", findings: "Decreased cervical lordosis, muscle spasm in upper trapezius" },
          { system: "Neurological", findings: "Diminished sensation C6 distribution right arm" }
        ],
        specialTests: [
          { test: "Spurling's Test", result: "Positive on right side" },
          { test: "Cervical Compression", result: "Reproduces arm symptoms" }
        ],
        imagingLabs: [
          { type: "X-ray Cervical Spine", date: "2024-01-12", results: "Loss of normal cervical lordosis, mild degenerative changes C5-C6" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M54.2", description: "Cervicalgia", type: "Primary" },
          { code: "G44.209", description: "Tension-type headache, unspecified, not intractable", type: "Secondary" }
        ],
        clinicalImpression: "45-year-old male construction worker with cervical strain and tension headaches following workplace injury. Symptoms consistent with cervical radiculopathy."
      },
      plan: {
        treatments: [
          { type: "Cervical Manipulation", frequency: "3x/week for 4 weeks", provider: "Dr. Silverman" },
          { type: "Massage Therapy", frequency: "2x/week for 3 weeks", provider: "Healing Hands Therapy" }
        ],
        medications: [
          { name: "Naproxen", dosage: "500mg", frequency: "BID with food", duration: "10 days" },
          { name: "Methocarbamol", dosage: "750mg", frequency: "TID", duration: "1 week" }
        ],
        additionalInstructions: "Ergonomic evaluation at workplace recommended. Use cervical pillow for sleep support. Perform gentle neck stretches as demonstrated.",
        followUpInstructions: "Return in 1 week for reassessment. MRI may be indicated if no improvement in 2 weeks.",
        legalTags: ["Workers Compensation", "Workplace Injury", "Construction Accident"]
      }
    }
  },
  {
    id: "3",
    first_name: "Linda",
    last_name: "Davis",
    email: "linda.davis@email.com",
    phone: "(555) 345-6789",
    date_of_birth: "1992-07-08",
    gender: "Female",
    address: "789 Pine Street",
    city: "Hollywood",
    state: "FL",
    zip_code: "33020",
    emergency_contact_name: "Michael Davis",
    emergency_contact_phone: "(555) 345-6790",
    insurance_provider: "United Healthcare",
    insurance_policy_number: "UHC456789123",
    tags: ["Acute Injury", "Sports Related"],
    is_active: true,
    created_at: "2024-01-17T14:15:00Z",
    updated_at: "2024-01-17T14:15:00Z",
    soapData: {
      subjective: {
        symptoms: ["Knee pain", "Swelling", "Difficulty walking", "Clicking sound"],
        painScale: 8,
        painDescription: "Sharp pain on medial aspect of right knee, especially when pivoting or climbing stairs. Swelling began immediately after injury.",
        otherSymptoms: "Knee feels unstable, can't fully extend, occasional locking sensation",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'4\"",
          weight: "125 lbs",
          bloodPressure: "110/70",
          heartRate: "64",
          temperature: "98.2°F",
          oxygenSaturation: "100%",
          respiratoryRate: "12"
        },
        systemExams: [
          { system: "Right Knee", findings: "Moderate effusion, tenderness over medial joint line, limited ROM" },
          { system: "Musculoskeletal", findings: "Antalgic gait, favoring right leg" }
        ],
        specialTests: [
          { test: "McMurray Test", result: "Positive for medial meniscus tear" },
          { test: "Lachman Test", result: "Negative for ACL injury" },
          { test: "Valgus Stress Test", result: "Mild laxity, suggests MCL strain" }
        ],
        imagingLabs: [
          { type: "MRI Right Knee", date: "2024-01-15", results: "Medial meniscus tear, Grade 2 MCL sprain, moderate joint effusion" }
        ],
        procedures: [
          { procedure: "Knee aspiration", date: "2024-01-17", results: "60ml clear synovial fluid removed" }
        ]
      },
      assessment: {
        diagnoses: [
          { code: "S83.241A", description: "Bucket-handle tear of medial meniscus, current injury, right knee", type: "Primary" },
          { code: "S83.421A", description: "Sprain of medial collateral ligament of right knee", type: "Secondary" }
        ],
        clinicalImpression: "31-year-old female athlete with acute knee injury sustained during soccer. MRI confirms medial meniscus tear and MCL sprain requiring conservative vs. surgical management."
      },
      plan: {
        treatments: [
          { type: "Physical Therapy", frequency: "3x/week for 8 weeks", provider: "Sports Rehab Center" },
          { type: "Orthopedic Consultation", frequency: "1x", provider: "Dr. Johnson, Orthopedic Surgery" }
        ],
        medications: [
          { name: "Meloxicam", dosage: "15mg", frequency: "Daily with food", duration: "2 weeks" },
          { name: "Acetaminophen", dosage: "650mg", frequency: "QID PRN pain", duration: "As needed" }
        ],
        additionalInstructions: "RICE protocol (Rest, Ice, Compression, Elevation). Non-weight bearing for 48 hours, then progress to partial weight bearing with crutches. Knee brace for support during ambulation.",
        followUpInstructions: "Return in 1 week for reassessment. Orthopedic consultation scheduled for surgical evaluation. Continue current restrictions until cleared.",
        legalTags: ["Sports Injury", "Acute Trauma"]
      }
    }
  },
  {
    id: "4",
    first_name: "Robert",
    last_name: "Martinez",
    email: "robert.martinez@email.com",
    phone: "(555) 456-7890",
    date_of_birth: "1965-12-03",
    gender: "Male",
    address: "321 Maple Drive",
    city: "Coral Springs",
    state: "FL",
    zip_code: "33065",
    emergency_contact_name: "Elena Martinez",
    emergency_contact_phone: "(555) 456-7891",
    insurance_provider: "Medicare",
    insurance_policy_number: "MCARE123456789",
    tags: ["Chronic Condition", "Diabetes", "Hypertension"],
    is_active: true,
    created_at: "2024-01-18T11:20:00Z",
    updated_at: "2024-01-18T11:20:00Z",
    soapData: {
      subjective: {
        symptoms: ["Chronic shoulder pain", "Stiffness", "Weakness", "Sleep disruption"],
        painScale: 5,
        painDescription: "Deep, aching pain in right shoulder that's been gradually worsening over 6 months. Particularly bothersome at night.",
        otherSymptoms: "Difficulty reaching overhead, pain when lying on affected side, progressive weakness in arm",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'9\"",
          weight: "195 lbs",
          bloodPressure: "145/90",
          heartRate: "76",
          temperature: "98.8°F",
          oxygenSaturation: "97%",
          respiratoryRate: "18"
        },
        systemExams: [
          { system: "Right Shoulder", findings: "Limited active ROM, especially abduction and external rotation" },
          { system: "Cardiovascular", findings: "Regular rate and rhythm, no murmurs" }
        ],
        specialTests: [
          { test: "Neer Impingement Sign", result: "Positive" },
          { test: "Hawkins-Kennedy Test", result: "Positive" },
          { test: "Empty Can Test", result: "Weakness and pain noted" }
        ],
        imagingLabs: [
          { type: "X-ray Right Shoulder", date: "2024-01-16", results: "Mild degenerative changes, no acute fracture" },
          { type: "MRI Right Shoulder", date: "2024-01-14", results: "Partial thickness rotator cuff tear, subacromial bursitis" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M75.30", description: "Calcific tendinitis of unspecified shoulder", type: "Primary" },
          { code: "M75.50", description: "Bursitis of unspecified shoulder", type: "Secondary" },
          { code: "E11.9", description: "Type 2 diabetes mellitus without complications", type: "Comorbidity" }
        ],
        clinicalImpression: "58-year-old male with chronic right shoulder impingement syndrome and partial rotator cuff tear. Diabetic patient requiring careful medication management."
      },
      plan: {
        treatments: [
          { type: "Physical Therapy", frequency: "2x/week for 6 weeks", provider: "Shoulder Specialists PT" },
          { type: "Corticosteroid Injection", frequency: "1x", provider: "Dr. Silverman" }
        ],
        medications: [
          { name: "Diclofenac Gel", dosage: "1% topical", frequency: "TID to affected area", duration: "4 weeks" },
          { name: "Tramadol", dosage: "50mg", frequency: "BID PRN severe pain", duration: "2 weeks" }
        ],
        additionalInstructions: "Avoid overhead activities. Apply ice after exercises. Monitor blood glucose levels closely due to steroid injection. Diabetes management review with PCP.",
        followUpInstructions: "Return in 3 weeks post-injection for reassessment. Orthopedic referral if no improvement. Coordinate care with endocrinologist.",
        legalTags: ["Chronic Pain Management", "Diabetic Patient"]
      }
    }
  },
  {
    id: "5",
    first_name: "Amanda",
    last_name: "Wilson",
    email: "amanda.wilson@email.com",
    phone: "(555) 567-8901",
    date_of_birth: "1988-04-25",
    gender: "Female",
    address: "654 Cedar Lane",
    city: "Plantation",
    state: "FL",
    zip_code: "33324",
    emergency_contact_name: "David Wilson",
    emergency_contact_phone: "(555) 567-8902",
    insurance_provider: "Cigna",
    insurance_policy_number: "CIG789012345",
    tags: ["Pregnancy Related", "Post-Partum"],
    is_active: true,
    created_at: "2024-01-19T10:45:00Z",
    updated_at: "2024-01-19T10:45:00Z",
    soapData: {
      subjective: {
        symptoms: ["Lower back pain", "Pelvic pain", "Hip discomfort", "Fatigue"],
        painScale: 6,
        painDescription: "Dull, constant ache in lower back and pelvis since delivery 6 weeks ago. Pain worsens with prolonged standing or lifting.",
        otherSymptoms: "Difficulty sleeping, occasional shooting pain down legs, muscle tension in hips",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'7\"",
          weight: "158 lbs",
          bloodPressure: "118/75",
          heartRate: "78",
          temperature: "98.5°F",
          oxygenSaturation: "99%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Lumbar Spine", findings: "Increased lumbar lordosis, tender sacroiliac joints" },
          { system: "Pelvic", findings: "Diastasis recti present, pelvic floor weakness" }
        ],
        specialTests: [
          { test: "FABER Test", result: "Positive bilaterally for SI joint dysfunction" },
          { test: "Straight Leg Raise", result: "Negative for radiculopathy" }
        ],
        imagingLabs: [],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "O26.899", description: "Other specified pregnancy related conditions", type: "Primary" },
          { code: "M53.3", description: "Sacrococcygeal disorders, not elsewhere classified", type: "Secondary" }
        ],
        clinicalImpression: "35-year-old postpartum female with pregnancy-related musculoskeletal changes causing lower back and pelvic pain. Diastasis recti and pelvic floor dysfunction contributing to symptoms."
      },
      plan: {
        treatments: [
          { type: "Postpartum Physical Therapy", frequency: "2x/week for 8 weeks", provider: "Women's Health PT Center" },
          { type: "Gentle Chiropractic Care", frequency: "1x/week for 4 weeks", provider: "Dr. Silverman" }
        ],
        medications: [
          { name: "Acetaminophen", dosage: "650mg", frequency: "TID PRN pain", duration: "As needed" },
          { name: "Magnesium", dosage: "400mg", frequency: "Daily", duration: "Ongoing" }
        ],
        additionalInstructions: "Avoid heavy lifting >20 lbs. Use proper body mechanics when lifting baby. Pelvic floor exercises as instructed. Supportive maternity belt during activities.",
        followUpInstructions: "Return in 3 weeks for progress evaluation. Continue breastfeeding as desired - all treatments are compatible. OB clearance for increased activity level.",
        legalTags: ["Postpartum Care", "Women's Health"]
      }
    }
  },
  {
    id: "6",
    first_name: "Charles",
    last_name: "Brown",
    email: "charles.brown@email.com",
    phone: "(555) 678-9012",
    date_of_birth: "1972-09-14",
    gender: "Male",
    address: "987 Birch Street",
    city: "Davie",
    state: "FL",
    zip_code: "33328",
    emergency_contact_name: "Michelle Brown",
    emergency_contact_phone: "(555) 678-9013",
    insurance_provider: "Humana",
    insurance_policy_number: "HUM345678901",
    tags: ["Auto Accident", "Whiplash", "Litigation"],
    is_active: true,
    created_at: "2024-01-20T13:30:00Z",
    updated_at: "2024-01-20T13:30:00Z",
    soapData: {
      subjective: {
        symptoms: ["Neck pain", "Headaches", "Dizziness", "Memory issues"],
        painScale: 7,
        painDescription: "Severe neck pain with radiation to shoulders and upper back. Constant headaches since accident 3 days ago.",
        otherSymptoms: "Difficulty concentrating, mood changes, nausea, light sensitivity",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'11\"",
          weight: "175 lbs",
          bloodPressure: "135/88",
          heartRate: "82",
          temperature: "98.7°F",
          oxygenSaturation: "98%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Cervical Spine", findings: "Severe muscle spasm, loss of normal cervical curve" },
          { system: "Neurological", findings: "Mild cognitive impairment, balance issues" }
        ],
        specialTests: [
          { test: "Cervical Range of Motion", result: "Severely limited in all planes" },
          { test: "Balance Assessment", result: "Mild impairment noted" }
        ],
        imagingLabs: [
          { type: "CT Head", date: "2024-01-18", results: "No acute intracranial pathology" },
          { type: "X-ray Cervical Spine", date: "2024-01-18", results: "Loss of normal lordosis, no fracture" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "S13.4XXA", description: "Sprain of ligaments of cervical spine, initial encounter", type: "Primary" },
          { code: "S06.0X0A", description: "Concussion without loss of consciousness, initial encounter", type: "Secondary" }
        ],
        clinicalImpression: "51-year-old male involved in rear-end motor vehicle collision with acute cervical strain and mild traumatic brain injury. Symptoms consistent with whiplash-associated disorder grade II-III."
      },
      plan: {
        treatments: [
          { type: "Cervical Stabilization", frequency: "Daily for 1 week", provider: "Cervical collar" },
          { type: "Physical Medicine", frequency: "3x/week when acute phase resolves", provider: "Spine Center" }
        ],
        medications: [
          { name: "Prednisone", dosage: "20mg", frequency: "Daily x5 days, then taper", duration: "10 days" },
          { name: "Cyclobenzaprine", dosage: "10mg", frequency: "TID", duration: "1 week" }
        ],
        additionalInstructions: "Complete rest for 48 hours. Avoid driving until cleared. Ice therapy 20 minutes every 2 hours. Gradual return to activities as tolerated.",
        followUpInstructions: "Return in 1 week for reassessment. Neuropsychological evaluation if cognitive symptoms persist. Attorney coordination as needed.",
        legalTags: ["Motor Vehicle Accident", "Liability Case", "Attorney Representation"]
      }
    }
  },
  {
    id: "7",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 789-0123",
    date_of_birth: "1996-02-11",
    gender: "Female",
    address: "147 Elm Avenue",
    city: "Pembroke Pines",
    state: "FL",
    zip_code: "33027",
    emergency_contact_name: "Jennifer Johnson",
    emergency_contact_phone: "(555) 789-0124",
    insurance_provider: "Florida Blue",
    insurance_policy_number: "FB234567890",
    tags: ["Young Adult", "Sports Medicine", "Runner"],
    is_active: true,
    created_at: "2024-01-21T16:00:00Z",
    updated_at: "2024-01-21T16:00:00Z",
    soapData: {
      subjective: {
        symptoms: ["Shin pain", "Muscle tightness", "Swelling", "Exercise intolerance"],
        painScale: 6,
        painDescription: "Bilateral shin pain that develops during running, particularly after 2-3 miles. Pain subsides with rest but returns with activity.",
        otherSymptoms: "Muscle cramps at night, tightness in calves, occasional burning sensation",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'5\"",
          weight: "130 lbs",
          bloodPressure: "105/65",
          heartRate: "58",
          temperature: "98.3°F",
          oxygenSaturation: "100%",
          respiratoryRate: "12"
        },
        systemExams: [
          { system: "Lower Extremities", findings: "Tenderness over medial tibial border bilaterally" },
          { system: "Musculoskeletal", findings: "Tight gastrocnemius and soleus muscles" }
        ],
        specialTests: [
          { test: "Hop Test", result: "Pain reproduced with single leg hopping" },
          { test: "Compartment Pressure", result: "Elevated post-exercise pressures" }
        ],
        imagingLabs: [
          { type: "X-ray Lower Legs", date: "2024-01-19", results: "No stress fractures identified" },
          { type: "Bone Scan", date: "2024-01-17", results: "Increased uptake consistent with medial tibial stress syndrome" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M76.811", description: "Medial tibial stress syndrome, right leg", type: "Primary" },
          { code: "M76.812", description: "Medial tibial stress syndrome, left leg", type: "Primary" }
        ],
        clinicalImpression: "27-year-old competitive runner with bilateral medial tibial stress syndrome (shin splints). Overuse injury requiring activity modification and biomechanical assessment."
      },
      plan: {
        treatments: [
          { type: "Sports Physical Therapy", frequency: "3x/week for 4 weeks", provider: "Athletic Performance Center" },
          { type: "Gait Analysis", frequency: "1x", provider: "Running Specialists" }
        ],
        medications: [
          { name: "Ibuprofen", dosage: "400mg", frequency: "TID with meals", duration: "10 days" },
          { name: "Topical Arnica", dosage: "Apply", frequency: "BID to affected areas", duration: "As needed" }
        ],
        additionalInstructions: "Complete running rest for 2 weeks. Cross-training with swimming or cycling allowed. Gradual return to running program with 10% weekly mileage increase. Proper footwear assessment.",
        followUpInstructions: "Return in 2 weeks for clearance to resume running. Sports medicine consultation if symptoms persist. Running technique analysis recommended.",
        legalTags: ["Sports Medicine", "Overuse Injury"]
      }
    }
  },
  {
    id: "8",
    first_name: "Michael",
    last_name: "Garcia",
    email: "michael.garcia@email.com",
    phone: "(555) 890-1234",
    date_of_birth: "1983-08-07",
    gender: "Male",
    address: "258 Willow Road",
    city: "Miramar",
    state: "FL",
    zip_code: "33025",
    emergency_contact_name: "Patricia Garcia",
    emergency_contact_phone: "(555) 890-1235",
    insurance_provider: "Tricare",
    insurance_policy_number: "TRI456789012",
    tags: ["Veteran", "PTSD", "Chronic Pain"],
    is_active: true,
    created_at: "2024-01-22T12:15:00Z",
    updated_at: "2024-01-22T12:15:00Z",
    soapData: {
      subjective: {
        symptoms: ["Chronic back pain", "Sleep disturbances", "Anxiety", "Muscle tension"],
        painScale: 8,
        painDescription: "Constant burning pain in mid and lower back. Pain significantly worsens with stress and weather changes. Has been ongoing for 3 years since military service.",
        otherSymptoms: "Nightmares, hypervigilance, muscle tension throughout shoulders and neck, irritability",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'10\"",
          weight: "190 lbs",
          bloodPressure: "140/92",
          heartRate: "88",
          temperature: "98.6°F",
          oxygenSaturation: "97%",
          respiratoryRate: "18"
        },
        systemExams: [
          { system: "Musculoskeletal", findings: "Widespread muscle tension, trigger points in trapezius" },
          { system: "Psychological", findings: "Anxious affect, hypervigilant behavior" }
        ],
        specialTests: [
          { test: "Trigger Point Assessment", result: "Multiple active trigger points identified" },
          { test: "Functional Movement Screen", result: "Compensatory movement patterns noted" }
        ],
        imagingLabs: [
          { type: "MRI Lumbar Spine", date: "2024-01-15", results: "Mild degenerative disc disease L4-L5, no significant stenosis" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M54.5", description: "Low back pain", type: "Primary" },
          { code: "F43.10", description: "Post-traumatic stress disorder, unspecified", type: "Comorbidity" },
          { code: "M79.1", description: "Myalgia", type: "Secondary" }
        ],
        clinicalImpression: "40-year-old military veteran with chronic pain syndrome and PTSD. Complex pain presentation requiring multimodal approach addressing both physical and psychological components."
      },
      plan: {
        treatments: [
          { type: "Trauma-Informed Physical Therapy", frequency: "2x/week for 8 weeks", provider: "Veteran Services PT" },
          { type: "Mental Health Counseling", frequency: "1x/week", provider: "VA Psychology Services" }
        ],
        medications: [
          { name: "Gabapentin", dosage: "300mg", frequency: "TID, titrate as needed", duration: "Ongoing" },
          { name: "Trazodone", dosage: "50mg", frequency: "QHS for sleep", duration: "As needed" }
        ],
        additionalInstructions: "Stress management techniques including deep breathing and progressive muscle relaxation. Regular sleep schedule. Limit caffeine intake. Consider yoga or meditation.",
        followUpInstructions: "Return in 3 weeks for pain reassessment. Coordinate care with VA mental health services. Monitor for medication side effects and efficacy.",
        legalTags: ["Veteran Affairs", "Service Connected Disability", "PTSD Treatment"]
      }
    }
  },
  {
    id: "9",
    first_name: "Jennifer",
    last_name: "Lee",
    email: "jennifer.lee@email.com",
    phone: "(555) 901-2345",
    date_of_birth: "1990-01-30",
    gender: "Female",
    address: "369 Rose Street",
    city: "Weston",
    state: "FL",
    zip_code: "33326",
    emergency_contact_name: "Kevin Lee",
    emergency_contact_phone: "(555) 901-2346",
    insurance_provider: "Oscar Health",
    insurance_policy_number: "OSC567890123",
    tags: ["Office Worker", "Ergonomic Issues", "Tech Professional"],
    is_active: true,
    created_at: "2024-01-23T09:00:00Z",
    updated_at: "2024-01-23T09:00:00Z",
    soapData: {
      subjective: {
        symptoms: ["Wrist pain", "Finger numbness", "Neck stiffness", "Eye strain"],
        painScale: 5,
        painDescription: "Sharp, shooting pain in right wrist and fingers, especially thumb, index, and middle finger. Worse after long computer sessions.",
        otherSymptoms: "Tingling sensation that wakes me up at night, weakness when gripping objects, occasional dropping of items",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'3\"",
          weight: "115 lbs",
          bloodPressure: "108/68",
          heartRate: "70",
          temperature: "98.1°F",
          oxygenSaturation: "99%",
          respiratoryRate: "14"
        },
        systemExams: [
          { system: "Right Upper Extremity", findings: "Positive Tinel's and Phalen's signs" },
          { system: "Cervical Spine", findings: "Forward head posture, upper cross syndrome" }
        ],
        specialTests: [
          { test: "Phalen's Test", result: "Positive at 30 seconds" },
          { test: "Tinel's Sign", result: "Positive over carpal tunnel" },
          { test: "Nerve Conduction Study", result: "Delayed median nerve conduction" }
        ],
        imagingLabs: [
          { type: "EMG/NCS", date: "2024-01-20", results: "Mild to moderate carpal tunnel syndrome confirmed" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "G56.00", description: "Carpal tunnel syndrome, unspecified upper limb", type: "Primary" },
          { code: "M54.2", description: "Cervicalgia", type: "Secondary" }
        ],
        clinicalImpression: "33-year-old software engineer with repetitive strain injury resulting in carpal tunnel syndrome and cervical dysfunction from prolonged computer use."
      },
      plan: {
        treatments: [
          { type: "Occupational Therapy", frequency: "2x/week for 6 weeks", provider: "Hand Therapy Specialists" },
          { type: "Ergonomic Assessment", frequency: "1x", provider: "Workplace Wellness Solutions" }
        ],
        medications: [
          { name: "Naproxen", dosage: "220mg", frequency: "BID with food", duration: "2 weeks" },
          { name: "Vitamin B6", dosage: "100mg", frequency: "Daily", duration: "6 weeks" }
        ],
        additionalInstructions: "Wrist splint at night and during computer work. Take frequent breaks every 30 minutes. Adjust workstation ergonomics. Perform nerve gliding exercises as instructed.",
        followUpInstructions: "Return in 4 weeks for reassessment. If no improvement, consider corticosteroid injection or surgical consultation. Workplace accommodation letter provided.",
        legalTags: ["Repetitive Strain Injury", "Workplace Ergonomics"]
      }
    }
  },
  {
    id: "10",
    first_name: "David",
    last_name: "Anderson",
    email: "david.anderson@email.com",
    phone: "(555) 012-3456",
    date_of_birth: "1955-06-18",
    gender: "Male",
    address: "741 Sunset Boulevard",
    city: "Cooper City",
    state: "FL",
    zip_code: "33330",
    emergency_contact_name: "Betty Anderson",
    emergency_contact_phone: "(555) 012-3457",
    insurance_provider: "Medicare Advantage",
    insurance_policy_number: "MADV789012345",
    tags: ["Senior", "Arthritis", "Multiple Conditions"],
    is_active: true,
    created_at: "2024-01-24T15:30:00Z",
    updated_at: "2024-01-24T15:30:00Z",
    soapData: {
      subjective: {
        symptoms: ["Joint stiffness", "Hip pain", "Difficulty walking", "Morning stiffness"],
        painScale: 6,
        painDescription: "Deep, aching pain in both hips and knees that's worse in the morning and after periods of inactivity. Has been gradually worsening over several years.",
        otherSymptoms: "Increased difficulty with stairs, getting out of chairs, occasional swelling in knees",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'8\"",
          weight: "205 lbs",
          bloodPressure: "150/95",
          heartRate: "74",
          temperature: "98.4°F",
          oxygenSaturation: "96%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Bilateral Hips", findings: "Decreased range of motion, crepitus on movement" },
          { system: "Bilateral Knees", findings: "Mild effusion, bony enlargement" }
        ],
        specialTests: [
          { test: "FABER Test", result: "Limited range bilaterally" },
          { test: "Knee Flexion", result: "120 degrees bilaterally (limited)" }
        ],
        imagingLabs: [
          { type: "X-ray Hips", date: "2024-01-22", results: "Moderate osteoarthritis with joint space narrowing" },
          { type: "X-ray Knees", date: "2024-01-22", results: "Mild to moderate osteoarthritic changes" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M16.0", description: "Primary osteoarthritis of hip, bilateral", type: "Primary" },
          { code: "M17.0", description: "Primary osteoarthritis of knee, bilateral", type: "Secondary" },
          { code: "I10", description: "Essential hypertension", type: "Comorbidity" }
        ],
        clinicalImpression: "68-year-old male with progressive bilateral hip and knee osteoarthritis causing functional limitations. Hypertensive requiring careful medication selection."
      },
      plan: {
        treatments: [
          { type: "Aquatic Physical Therapy", frequency: "2x/week for 8 weeks", provider: "Senior Wellness Center" },
          { type: "Weight Management Counseling", frequency: "1x/month", provider: "Nutrition Services" }
        ],
        medications: [
          { name: "Acetaminophen", dosage: "650mg", frequency: "TID", duration: "Ongoing" },
          { name: "Glucosamine/Chondroitin", dosage: "1500mg/1200mg", frequency: "Daily", duration: "Trial 3 months" }
        ],
        additionalInstructions: "Weight loss goal of 15-20 pounds to reduce joint stress. Use assistive devices as needed (cane, walker). Heat therapy before activity, ice after. Low-impact exercises only.",
        followUpInstructions: "Return in 6 weeks for progress evaluation. Orthopedic consultation for potential joint injection or replacement evaluation. Cardiology follow-up for hypertension management.",
        legalTags: ["Geriatric Care", "Chronic Disease Management"]
      }
    }
  },
  {
    id: "11",
    first_name: "Nicole",
    last_name: "Taylor",
    email: "nicole.taylor@email.com",
    phone: "(555) 123-4567",
    date_of_birth: "1987-10-12",
    gender: "Female",
    address: "852 Ocean Drive",
    city: "Dania Beach",
    state: "FL",
    zip_code: "33004",
    emergency_contact_name: "Mark Taylor",
    emergency_contact_phone: "(555) 123-4568",
    insurance_provider: "Anthem",
    insurance_policy_number: "ANT890123456",
    tags: ["Fibromyalgia", "Chronic Fatigue", "Autoimmune"],
    is_active: true,
    created_at: "2024-01-25T11:45:00Z",
    updated_at: "2024-01-25T11:45:00Z",
    soapData: {
      subjective: {
        symptoms: ["Widespread pain", "Chronic fatigue", "Sleep issues", "Brain fog"],
        painScale: 7,
        painDescription: "Constant, deep muscle pain throughout entire body with tender points. Pain fluctuates but never completely resolves. Described as burning, aching sensation.",
        otherSymptoms: "Severe fatigue despite adequate sleep, difficulty concentrating, memory problems, mood swings, sensitive to light and noise",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'6\"",
          weight: "140 lbs",
          bloodPressure: "115/75",
          heartRate: "85",
          temperature: "98.2°F",
          oxygenSaturation: "99%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Musculoskeletal", findings: "18/18 tender points positive for fibromyalgia" },
          { system: "Neurological", findings: "Mild cognitive impairment, no focal deficits" }
        ],
        specialTests: [
          { test: "Fibromyalgia Tender Point Exam", result: "Positive 18/18 points" },
          { test: "Fibromyalgia Impact Questionnaire", result: "Score 65/100 (severe impact)" }
        ],
        imagingLabs: [
          { type: "Complete Blood Panel", date: "2024-01-23", results: "Normal CBC, ESR, CRP within normal limits" },
          { type: "Thyroid Function", date: "2024-01-23", results: "TSH, T3, T4 within normal range" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M79.3", description: "Panniculitis, unspecified", type: "Primary" },
          { code: "G93.3", description: "Postviral fatigue syndrome", type: "Secondary" },
          { code: "F32.9", description: "Major depressive disorder, single episode, unspecified", type: "Comorbidity" }
        ],
        clinicalImpression: "36-year-old female with classic presentation of fibromyalgia syndrome with associated chronic fatigue and mood disorder. Requires multimodal treatment approach."
      },
      plan: {
        treatments: [
          { type: "Gentle Exercise Program", frequency: "3x/week", provider: "Fibromyalgia Wellness Center" },
          { type: "Cognitive Behavioral Therapy", frequency: "1x/week for 12 weeks", provider: "Pain Psychology Services" }
        ],
        medications: [
          { name: "Pregabalin", dosage: "75mg", frequency: "BID, titrate to effect", duration: "Ongoing" },
          { name: "Duloxetine", dosage: "30mg", frequency: "Daily, increase to 60mg", duration: "Ongoing" }
        ],
        additionalInstructions: "Sleep hygiene education. Stress management techniques. Pacing activities to prevent flare-ups. Gentle stretching and low-impact aerobic exercise. Support group participation.",
        followUpInstructions: "Return in 4 weeks for medication adjustment and symptom reassessment. Rheumatology consultation for comprehensive evaluation. Mental health follow-up as needed.",
        legalTags: ["Chronic Pain Syndrome", "Disability Assessment"]
      }
    }
  },
  {
    id: "12",
    first_name: "Kevin",
    last_name: "White",
    email: "kevin.white@email.com",
    phone: "(555) 234-5678",
    date_of_birth: "1995-05-03",
    gender: "Male",
    address: "963 Palm Avenue",
    city: "Sunrise",
    state: "FL",
    zip_code: "33323",
    emergency_contact_name: "Susan White",
    emergency_contact_phone: "(555) 234-5679",
    insurance_provider: "Molina Healthcare",
    insurance_policy_number: "MOL012345678",
    tags: ["Construction Worker", "Hand Injury", "Young Adult"],
    is_active: true,
    created_at: "2024-01-26T14:20:00Z",
    updated_at: "2024-01-26T14:20:00Z",
    soapData: {
      subjective: {
        symptoms: ["Hand pain", "Finger stiffness", "Weakness", "Swelling"],
        painScale: 8,
        painDescription: "Severe pain in right hand after being crushed by falling beam yesterday. Can barely move fingers, throbbing pain constant.",
        otherSymptoms: "Significant swelling, bruising across entire hand, unable to make a fist, very tender to touch",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "6'0\"",
          weight: "180 lbs",
          bloodPressure: "125/82",
          heartRate: "78",
          temperature: "98.8°F",
          oxygenSaturation: "98%",
          respiratoryRate: "14"
        },
        systemExams: [
          { system: "Right Hand", findings: "Significant edema, ecchymosis, limited range of motion" },
          { system: "Neurological", findings: "Intact sensation all digits, no motor deficits" }
        ],
        specialTests: [
          { test: "Grip Strength", result: "Severely decreased compared to left hand" },
          { test: "Pinch Strength", result: "Unable to perform due to pain" }
        ],
        imagingLabs: [
          { type: "X-ray Right Hand", date: "2024-01-25", results: "No acute fractures, soft tissue swelling present" },
          { type: "MRI Right Hand", date: "2024-01-26", results: "Severe soft tissue contusion, no tendon rupture" }
        ],
        procedures: [
          { procedure: "Hand elevation and splinting", date: "2024-01-26", results: "Temporary immobilization applied" }
        ]
      },
      assessment: {
        diagnoses: [
          { code: "S69.91XA", description: "Unspecified injury of right wrist, hand and finger(s), initial encounter", type: "Primary" },
          { code: "S60.91XA", description: "Unspecified superficial injury of right wrist, initial encounter", type: "Secondary" }
        ],
        clinicalImpression: "28-year-old construction worker with severe hand contusion from crush injury. No fractures identified but significant soft tissue trauma requiring intensive rehabilitation."
      },
      plan: {
        treatments: [
          { type: "Hand Therapy", frequency: "3x/week for 6 weeks", provider: "Industrial Rehabilitation Center" },
          { type: "Occupational Medicine Evaluation", frequency: "1x", provider: "Work Injury Specialists" }
        ],
        medications: [
          { name: "Ibuprofen", dosage: "800mg", frequency: "TID with food", duration: "1 week" },
          { name: "Hydrocodone/Acetaminophen", dosage: "5/325mg", frequency: "Every 6 hours PRN severe pain", duration: "5 days" }
        ],
        additionalInstructions: "Elevation of hand above heart level. Ice therapy 20 minutes every 2 hours for 48 hours. No lifting >5 lbs with affected hand. Off work until cleared.",
        followUpInstructions: "Return in 1 week for reassessment and work clearance evaluation. Hand surgery consultation if no improvement. Workers compensation coordination required.",
        legalTags: ["Workers Compensation", "Industrial Injury", "Construction Accident"]
      }
    }
  },
  {
    id: "13",
    first_name: "Lisa",
    last_name: "Miller",
    email: "lisa.miller@email.com",
    phone: "(555) 345-6789",
    date_of_birth: "1979-03-28",
    gender: "Female",
    address: "147 Magnolia Street",
    city: "Tamarac",
    state: "FL",
    zip_code: "33321",
    emergency_contact_name: "Robert Miller",
    emergency_contact_phone: "(555) 345-6790",
    insurance_provider: "UnitedHealthcare",
    insurance_policy_number: "UHC345678901",
    tags: ["Migraine", "Chronic Headaches", "Stress"],
    is_active: true,
    created_at: "2024-01-27T10:30:00Z",
    updated_at: "2024-01-27T10:30:00Z",
    soapData: {
      subjective: {
        symptoms: ["Severe headaches", "Nausea", "Light sensitivity", "Neck pain"],
        painScale: 9,
        painDescription: "Intense, throbbing headache on right side of head that started 2 days ago. Feels like someone is hitting my head with a hammer.",
        otherSymptoms: "Vomiting twice this morning, can't tolerate bright lights or loud sounds, vision seems blurry, neck feels very stiff",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'4\"",
          weight: "135 lbs",
          bloodPressure: "140/90",
          heartRate: "92",
          temperature: "98.9°F",
          oxygenSaturation: "98%",
          respiratoryRate: "18"
        },
        systemExams: [
          { system: "Neurological", findings: "Photophobia, mild neck stiffness, no focal deficits" },
          { system: "Head/Neck", findings: "Temporal artery tenderness, cervical muscle spasm" }
        ],
        specialTests: [
          { test: "Neurological Screen", result: "Normal cranial nerves, reflexes intact" },
          { test: "Migraine Assessment", result: "Meets criteria for migraine with aura" }
        ],
        imagingLabs: [
          { type: "CT Head", date: "2024-01-27", results: "No acute intracranial pathology" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "G43.109", description: "Migraine with aura, not intractable, without status migrainosus", type: "Primary" },
          { code: "M54.2", description: "Cervicalgia", type: "Secondary" }
        ],
        clinicalImpression: "44-year-old female with acute migraine episode with associated cervical tension. History suggests chronic migraine pattern requiring preventive management."
      },
      plan: {
        treatments: [
          { type: "Trigger Point Injections", frequency: "1x", provider: "Dr. Silverman" },
          { type: "Stress Management Counseling", frequency: "Bi-weekly for 8 weeks", provider: "Behavioral Health Services" }
        ],
        medications: [
          { name: "Sumatriptan", dosage: "100mg", frequency: "At onset, may repeat once", duration: "PRN acute episodes" },
          { name: "Propranolol", dosage: "40mg", frequency: "BID for prevention", duration: "3 month trial" }
        ],
        additionalInstructions: "Dark, quiet room for rest. Cold compress to head/neck. Maintain headache diary to identify triggers. Regular sleep schedule. Adequate hydration.",
        followUpInstructions: "Return in 2 weeks for headache diary review and medication adjustment. Neurology referral if preventive therapy fails. Emergency care if severe neurological symptoms develop.",
        legalTags: ["Chronic Headache Management", "Migraine Treatment"]
      }
    }
  },
  {
    id: "14",
    first_name: "Steven",
    last_name: "Clark",
    email: "steven.clark@email.com",
    phone: "(555) 456-7890",
    date_of_birth: "1991-12-15",
    gender: "Male",
    address: "258 Harbor View",
    city: "Hallandale Beach",
    state: "FL",
    zip_code: "33009",
    emergency_contact_name: "Amy Clark",
    emergency_contact_phone: "(555) 456-7891",
    insurance_provider: "Bright Health",
    insurance_policy_number: "BH456789012",
    tags: ["Cyclist", "Road Rash", "Multiple Abrasions"],
    is_active: true,
    created_at: "2024-01-28T08:45:00Z",
    updated_at: "2024-01-28T08:45:00Z",
    soapData: {
      subjective: {
        symptoms: ["Road rash", "Multiple cuts", "Bruising", "Joint pain"],
        painScale: 6,
        painDescription: "Burning, stinging pain from extensive road rash on right side of body. Fell off bike at 25 mph this morning.",
        otherSymptoms: "Deep abrasions on right arm, leg, and hip. Some cuts still bleeding. Right shoulder and elbow are very sore.",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'9\"",
          weight: "165 lbs",
          bloodPressure: "120/78",
          heartRate: "85",
          temperature: "98.5°F",
          oxygenSaturation: "99%",
          respiratoryRate: "16"
        },
        systemExams: [
          { system: "Integumentary", findings: "Extensive abrasions right arm, leg, hip with embedded debris" },
          { system: "Musculoskeletal", findings: "Contusions right shoulder and elbow, full ROM with pain" }
        ],
        specialTests: [
          { test: "Wound Assessment", result: "Superficial to partial thickness abrasions, no deep tissue involvement" },
          { test: "Joint Examination", result: "No structural damage, consistent with contusions" }
        ],
        imagingLabs: [
          { type: "X-ray Right Shoulder", date: "2024-01-28", results: "No fracture or dislocation" },
          { type: "X-ray Right Elbow", date: "2024-01-28", results: "No acute bony abnormality" }
        ],
        procedures: [
          { procedure: "Wound irrigation and debridement", date: "2024-01-28", results: "Foreign material removed, wounds cleaned" }
        ]
      },
      assessment: {
        diagnoses: [
          { code: "S80.811A", description: "Abrasion of right lower leg, initial encounter", type: "Primary" },
          { code: "S40.811A", description: "Abrasion of right upper arm, initial encounter", type: "Secondary" },
          { code: "S70.311A", description: "Abrasion of right hip, initial encounter", type: "Secondary" }
        ],
        clinicalImpression: "32-year-old cyclist with extensive road rash and contusions from high-speed bicycle accident. No fractures identified. Wound care and infection prevention priority."
      },
      plan: {
        treatments: [
          { type: "Daily Wound Care", frequency: "Daily for 2 weeks", provider: "Home health or clinic" },
          { type: "Physical Therapy", frequency: "2x/week for 3 weeks", provider: "Sports Medicine PT" }
        ],
        medications: [
          { name: "Cephalexin", dosage: "500mg", frequency: "QID", duration: "7 days" },
          { name: "Ibuprofen", dosage: "600mg", frequency: "TID with food", duration: "1 week" }
        ],
        additionalInstructions: "Keep wounds clean and moist. Change dressings daily. Watch for signs of infection (increased redness, warmth, pus). No cycling until wounds heal. Tetanus booster if >5 years.",
        followUpInstructions: "Return in 3 days for wound check, then weekly until healed. Emergency care if signs of infection develop. Gradual return to cycling activities.",
        legalTags: ["Sports Injury", "Bicycle Accident"]
      }
    }
  },
  {
    id: "15",
    first_name: "Rachel",
    last_name: "Green",
    email: "rachel.green@email.com",
    phone: "(555) 567-8901",
    date_of_birth: "1986-09-22",
    gender: "Female",
    address: "369 Coral Way",
    city: "Aventura",
    state: "FL",
    zip_code: "33180",
    emergency_contact_name: "Daniel Green",
    emergency_contact_phone: "(555) 567-8902",
    insurance_provider: "Kaiser Permanente",
    insurance_policy_number: "KP567890123",
    tags: ["Teacher", "Stress", "TMJ"],
    is_active: true,
    created_at: "2024-01-29T13:15:00Z",
    updated_at: "2024-01-29T13:15:00Z",
    soapData: {
      subjective: {
        symptoms: ["Jaw pain", "Clicking sounds", "Headaches", "Ear pain"],
        painScale: 6,
        painDescription: "Aching pain in jaw joints that's worse in the morning and after eating. Loud clicking when opening mouth wide.",
        otherSymptoms: "Grinding teeth at night, difficulty chewing hard foods, occasional ear fullness, tension headaches",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'5\"",
          weight: "128 lbs",
          bloodPressure: "118/76",
          heartRate: "72",
          temperature: "98.3°F",
          oxygenSaturation: "99%",
          respiratoryRate: "14"
        },
        systemExams: [
          { system: "Temporomandibular Joint", findings: "Bilateral clicking, limited mouth opening to 35mm" },
          { system: "Head/Neck", findings: "Muscle tension in masseter and temporalis" }
        ],
        specialTests: [
          { test: "TMJ Range of Motion", result: "Limited opening, deviation to right" },
          { test: "Palpation TMJ", result: "Tenderness bilateral joint capsules" }
        ],
        imagingLabs: [
          { type: "Panoramic X-ray", date: "2024-01-28", results: "Mild degenerative changes TMJ bilaterally" }
        ],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "M26.69", description: "Other specified disorders of temporomandibular joint", type: "Primary" },
          { code: "G47.63", description: "Sleep related bruxism", type: "Secondary" }
        ],
        clinicalImpression: "37-year-old elementary school teacher with temporomandibular dysfunction and nocturnal bruxism, likely stress-related from demanding work environment."
      },
      plan: {
        treatments: [
          { type: "Nightguard Fitting", frequency: "1x", provider: "Dental Specialist" },
          { type: "Stress Management Program", frequency: "8 sessions", provider: "Employee Assistance Program" }
        ],
        medications: [
          { name: "Naproxen", dosage: "220mg", frequency: "BID with food", duration: "2 weeks" },
          { name: "Cyclobenzaprine", dosage: "5mg", frequency: "QHS", duration: "1 week" }
        ],
        additionalInstructions: "Soft diet for 2 weeks. Avoid gum chewing and wide mouth opening. Apply moist heat to jaw area. Jaw exercises as demonstrated. Stress reduction techniques.",
        followUpInstructions: "Return in 3 weeks for progress evaluation. Dental consultation for nightguard fabrication. Consider counseling if stress levels remain high.",
        legalTags: ["Occupational Stress", "TMJ Treatment"]
      }
    }
  },
  {
    id: "16",
    first_name: "Anthony",
    last_name: "Rodriguez",
    email: "anthony.rodriguez@email.com",
    phone: "(555) 678-9012",
    date_of_birth: "1975-11-05",
    gender: "Male",
    address: "741 Bayview Drive",
    city: "North Miami Beach",
    state: "FL",
    zip_code: "33154",
    emergency_contact_name: "Maria Rodriguez",
    emergency_contact_phone: "(555) 678-9013",
    insurance_provider: "Medicaid",
    insurance_policy_number: "MCD678901234",
    tags: ["Landscaper", "Heat Exhaustion", "Dehydration"],
    is_active: true,
    created_at: "2024-01-30T16:45:00Z",
    updated_at: "2024-01-30T16:45:00Z",
    soapData: {
      subjective: {
        symptoms: ["Dizziness", "Nausea", "Weakness", "Muscle cramps"],
        painScale: 4,
        painDescription: "Muscle cramping in legs and arms after working outside in heat all day. Feeling weak and dizzy.",
        otherSymptoms: "Stopped sweating about an hour ago, mild headache, very thirsty, feels like going to pass out",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'7\"",
          weight: "170 lbs",
          bloodPressure: "95/60",
          heartRate: "110",
          temperature: "101.2°F",
          oxygenSaturation: "97%",
          respiratoryRate: "20"
        },
        systemExams: [
          { system: "Skin", findings: "Hot, dry skin, poor skin turgor indicating dehydration" },
          { system: "Cardiovascular", findings: "Tachycardia, mild hypotension" }
        ],
        specialTests: [
          { test: "Orthostatic Vitals", result: "Positive for significant drop in BP with standing" },
          { test: "Hydration Assessment", result: "Moderate to severe dehydration" }
        ],
        imagingLabs: [
          { type: "Basic Metabolic Panel", date: "2024-01-30", results: "Elevated BUN/Creatinine, low sodium" },
          { type: "CBC", date: "2024-01-30", results: "Hemoconcentration present" }
        ],
        procedures: [
          { procedure: "IV fluid resuscitation", date: "2024-01-30", results: "2L normal saline administered" }
        ]
      },
      assessment: {
        diagnoses: [
          { code: "T67.5XXA", description: "Heat exhaustion, unspecified, initial encounter", type: "Primary" },
          { code: "E86.0", description: "Dehydration", type: "Secondary" }
        ],
        clinicalImpression: "48-year-old landscaper with heat exhaustion and moderate dehydration from prolonged sun exposure. Requires immediate rehydration and work modification."
      },
      plan: {
        treatments: [
          { type: "IV Hydration", frequency: "Today", provider: "Emergency/Urgent Care" },
          { type: "Work Safety Education", frequency: "1x", provider: "Occupational Health" }
        ],
        medications: [
          { name: "Electrolyte Solution", dosage: "16-24oz", frequency: "Every 2-4 hours", duration: "48 hours" },
          { name: "Acetaminophen", dosage: "650mg", frequency: "Every 6 hours PRN fever", duration: "As needed" }
        ],
        additionalInstructions: "Complete rest in cool environment for 24 hours. Gradual increase in fluid intake. No alcohol or caffeine. Monitor urine output and color. Avoid outdoor work until cleared.",
        followUpInstructions: "Return tomorrow for reassessment. Emergency care if symptoms worsen. Work clearance required before returning to outdoor activities. Heat illness prevention education.",
        legalTags: ["Occupational Heat Illness", "Work Safety Violation"]
      }
    }
  },
  {
    id: "17",
    first_name: "Michelle",
    last_name: "Harris",
    email: "michelle.harris@email.com",
    phone: "(555) 789-0123",
    date_of_birth: "1993-01-18",
    gender: "Female",
    address: "852 University Drive",
    city: "Coral Gables",
    state: "FL",
    zip_code: "33134",
    emergency_contact_name: "James Harris",
    emergency_contact_phone: "(555) 789-0124",
    insurance_provider: "Student Health Insurance",
    insurance_policy_number: "STU789012345",
    tags: ["Graduate Student", "Anxiety", "Sleep Disorders"],
    is_active: true,
    created_at: "2024-01-31T12:00:00Z",
    updated_at: "2024-01-31T12:00:00Z",
    soapData: {
      subjective: {
        symptoms: ["Muscle tension", "Headaches", "Sleep problems", "Fatigue"],
        painScale: 5,
        painDescription: "Constant tension in neck and shoulders that builds throughout the day. Headaches occur almost daily, especially when studying.",
        otherSymptoms: "Difficulty falling asleep, mind racing at night, waking up tired, difficulty concentrating during the day, occasional panic attacks",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: {
        vitalSigns: {
          height: "5'2\"",
          weight: "110 lbs",
          bloodPressure: "125/85",
          heartRate: "88",
          temperature: "98.1°F",
          oxygenSaturation: "99%",
          respiratoryRate: "18"
        },
        systemExams: [
          { system: "Musculoskeletal", findings: "Severe muscle tension in upper trapezius and suboccipital region" },
          { system: "Psychological", findings: "Anxious affect, rapid speech, fidgeting" }
        ],
        specialTests: [
          { test: "Anxiety Scale Assessment", result: "Moderate to severe anxiety (GAD-7 score: 14)" },
          { test: "Sleep Quality Index", result: "Poor sleep quality (PSQI score: 12)" }
        ],
        imagingLabs: [],
        procedures: []
      },
      assessment: {
        diagnoses: [
          { code: "F41.1", description: "Generalized anxiety disorder", type: "Primary" },
          { code: "G47.00", description: "Insomnia, unspecified", type: "Secondary" },
          { code: "M54.2", description: "Cervicalgia", type: "Secondary" }
        ],
        clinicalImpression: "30-year-old graduate student with stress-induced muscle tension, anxiety, and sleep disturbances related to academic pressures. Requires multimodal approach addressing both physical and psychological symptoms."
      },
      plan: {
        treatments: [
          { type: "Massage Therapy", frequency: "1x/week for 6 weeks", provider: "University Wellness Center" },
          { type: "Counseling Services", frequency: "1x/week", provider: "Student Mental Health Services" }
        ],
        medications: [
          { name: "Magnesium Glycinate", dosage: "400mg", frequency: "QHS", duration: "Ongoing" },
          { name: "Melatonin", dosage: "3mg", frequency: "30 min before bed", duration: "2 weeks trial" }
        ],
        additionalInstructions: "Sleep hygiene education: regular bedtime routine, limit screen time before bed, create calm environment. Stress management techniques including deep breathing and progressive muscle relaxation. Regular exercise schedule.",
        followUpInstructions: "Return in 3 weeks for anxiety and sleep reassessment. Consider anti-anxiety medication if symptoms persist. Academic counseling for stress management strategies.",
        legalTags: ["Student Health", "Academic Stress", "Mental Health"]
      }
    }
  }
];