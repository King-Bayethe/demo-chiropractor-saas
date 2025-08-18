-- Comprehensive mock data for SOAP notes showcase
-- Insert mock patients (diverse medical cases)
INSERT INTO public.patients (id, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, zip_code, insurance_provider, insurance_policy_number, emergency_contact_name, emergency_contact_phone, ghl_contact_id, is_active, tags) VALUES
(gen_random_uuid(), 'Michael', 'Rodriguez', 'michael.rodriguez@email.com', '555-0101', '1995-03-15', 'Male', '123 Sports Ave', 'Denver', 'CO', '80205', 'Athletic Health Insurance', 'AHI-789456', 'Maria Rodriguez', '555-0102', 'ghl_001', true, ARRAY['athlete', 'soccer', 'knee-injury']),
(gen_random_uuid(), 'Sarah', 'Chen', 'sarah.chen@email.com', '555-0201', '1978-11-22', 'Female', '456 Office Blvd', 'Austin', 'TX', '73301', 'Corporate Health Plan', 'CHP-456789', 'David Chen', '555-0202', 'ghl_002', true, ARRAY['chronic-pain', 'office-worker', 'back-pain']),
(gen_random_uuid(), 'Robert', 'Johnson', 'robert.johnson@email.com', '555-0301', '1952-07-08', 'Male', '789 Retirement Ln', 'Phoenix', 'AZ', '85001', 'Medicare Plus', 'MP-123456', 'Betty Johnson', '555-0302', 'ghl_003', true, ARRAY['post-surgical', 'knee-replacement', 'elderly']),
(gen_random_uuid(), 'Emma', 'Thompson', 'emma.thompson@email.com', '555-0401', '2015-04-12', 'Female', '321 Family St', 'Portland', 'OR', '97201', 'Pediatric Care Insurance', 'PCI-987654', 'Lisa Thompson', '555-0402', 'ghl_004', true, ARRAY['pediatric', 'asthma', 'child']),
(gen_random_uuid(), 'William', 'Davis', 'william.davis@email.com', '555-0501', '1943-12-03', 'Male', '654 Senior Way', 'Miami', 'FL', '33101', 'Senior Health Network', 'SHN-147258', 'Dorothy Davis', '555-0502', 'ghl_005', true, ARRAY['hypertension', 'diabetes', 'senior']),
(gen_random_uuid(), 'Jennifer', 'Wilson', 'jennifer.wilson@email.com', '555-0601', '1987-09-14', 'Female', '987 Corporate Dr', 'Chicago', 'IL', '60601', 'Executive Health Plan', 'EHP-369258', 'Mark Wilson', '555-0602', 'ghl_006', true, ARRAY['migraine', 'stress', 'executive']),
(gen_random_uuid(), 'Amanda', 'Garcia', 'amanda.garcia@email.com', '555-0701', '1992-01-28', 'Female', '147 Maternity Ave', 'San Diego', 'CA', '92101', 'Maternity Care Plus', 'MCP-741852', 'Carlos Garcia', '555-0702', 'ghl_007', true, ARRAY['pregnancy', 'prenatal', 'healthy']),
(gen_random_uuid(), 'James', 'Miller', 'james.miller@email.com', '555-0801', '1985-06-19', 'Male', '258 Construction St', 'Dallas', 'TX', '75201', 'Workers Compensation', 'WC-852963', 'Linda Miller', '555-0802', 'ghl_008', true, ARRAY['workplace-injury', 'shoulder', 'construction']);

-- Insert custom templates
INSERT INTO public.custom_templates (id, name, description, category, icon, specialty, keywords, age_groups, urgency_level, template_data, created_by, is_approved, is_active, version, organization_id) VALUES
(gen_random_uuid(), 'Orthopedic Knee Evaluation', 'Comprehensive knee assessment template for sports injuries and general orthopedic conditions', 'Orthopedics', '🦴', 'Orthopedic Surgery', ARRAY['knee', 'sports injury', 'orthopedic', 'ligament', 'meniscus'], ARRAY['adolescent', 'adult'], 'medium', 
'{
  "chiefComplaint": "Knee pain and instability following sports injury",
  "subjectiveTemplate": {
    "symptoms": ["knee pain", "swelling", "instability", "difficulty weight bearing"],
    "painDescription": "Sharp pain with movement, aching at rest",
    "otherSymptoms": "Patient reports hearing a pop during injury"
  },
  "objectiveTemplate": {
    "systemExams": [
      {
        "system": "Musculoskeletal",
        "findings": "Inspect for swelling, deformity, ecchymosis. Palpate for tenderness, warmth. Test range of motion, stability tests (Lachman, McMurray, drawer tests)"
      }
    ],
    "specialTests": [
      {"name": "Lachman Test", "result": "", "notes": ""},
      {"name": "McMurray Test", "result": "", "notes": ""},
      {"name": "Anterior Drawer Test", "result": "", "notes": ""}
    ]
  },
  "assessmentTemplate": {
    "diagnoses": [
      {"code": "S83.2", "description": "Meniscus tear"},
      {"code": "S83.5", "description": "Ligament injury of knee"}
    ],
    "clinicalImpression": "Rule out meniscal tear vs ligament injury"
  },
  "planTemplate": {
    "treatments": ["Rest", "Ice", "Compression", "Elevation", "Physical therapy"],
    "medications": [
      {"genericName": "Ibuprofen", "strength": "600mg", "frequency": "TID with food"}
    ],
    "followUpPeriod": "2 weeks",
    "additionalInstructions": "No weight bearing activities until follow-up. Begin gentle range of motion exercises as tolerated."
  }
}', 
(SELECT id FROM auth.users LIMIT 1), true, true, 1, 'silverman_clinic'),

(gen_random_uuid(), 'Sports Medicine Assessment', 'Comprehensive evaluation for athletic injuries and performance optimization', 'Sports Medicine', '⚽', 'Sports Medicine', ARRAY['sports', 'athletic injury', 'performance', 'concussion'], ARRAY['adolescent', 'adult'], 'high', 
'{
  "chiefComplaint": "Athletic injury evaluation and return-to-play assessment",
  "subjectiveTemplate": {
    "symptoms": ["pain during activity", "decreased performance", "functional limitation"],
    "painDescription": "Activity-related pain with specific movement patterns",
    "otherSymptoms": "Athlete reports impact on training and competition"
  },
  "objectiveTemplate": {
    "systemExams": [
      {
        "system": "Musculoskeletal",
        "findings": "Sport-specific functional assessment, movement screening, strength testing"
      },
      {
        "system": "Neurological",
        "findings": "Balance, coordination, reaction time assessment"
      }
    ],
    "specialTests": [
      {"name": "Functional Movement Screen", "result": "", "notes": ""},
      {"name": "Single Leg Hop Test", "result": "", "notes": ""},
      {"name": "Balance Error Scoring System", "result": "", "notes": ""}
    ]
  },
  "assessmentTemplate": {
    "diagnoses": [
      {"code": "M25.5", "description": "Joint pain"},
      {"code": "M62.8", "description": "Other specified disorders of muscle"}
    ],
    "clinicalImpression": "Athletic injury with functional limitations"
  },
  "planTemplate": {
    "treatments": ["Sport-specific rehabilitation", "Biomechanical correction", "Performance optimization"],
    "medications": [],
    "followUpPeriod": "1 week",
    "additionalInstructions": "Graduated return-to-play protocol. Avoid high-risk activities until cleared."
  }
}', 
(SELECT id FROM auth.users LIMIT 1), true, true, 1, 'silverman_clinic'),

(gen_random_uuid(), 'Chronic Pain Management', 'Comprehensive evaluation for patients with chronic pain conditions', 'Pain Management', '🎯', 'Pain Medicine', ARRAY['chronic pain', 'pain management', 'functional assessment'], ARRAY['adult', 'senior'], 'medium', 
'{
  "chiefComplaint": "Chronic pain evaluation and management optimization",
  "subjectiveTemplate": {
    "symptoms": ["persistent pain", "functional limitations", "sleep disturbance", "mood changes"],
    "painDescription": "Chronic, persistent pain with flare-ups",
    "otherSymptoms": "Impact on daily activities, work, and quality of life"
  },
  "objectiveTemplate": {
    "systemExams": [
      {
        "system": "Pain Assessment",
        "findings": "Pain scale rating, functional assessment, psychological screening"
      }
    ],
    "specialTests": [
      {"name": "Functional Assessment", "result": "", "notes": ""},
      {"name": "Pain Scale Assessment", "result": "", "notes": ""}
    ]
  },
  "assessmentTemplate": {
    "diagnoses": [
      {"code": "M79.3", "description": "Chronic pain syndrome"}
    ],
    "clinicalImpression": "Chronic pain with functional limitations"
  },
  "planTemplate": {
    "treatments": ["Multimodal pain management", "Physical therapy", "Behavioral therapy"],
    "medications": [
      {"genericName": "Gabapentin", "strength": "300mg", "frequency": "TID"}
    ],
    "followUpPeriod": "4 weeks",
    "additionalInstructions": "Pain diary recommended. Consider referral to pain management specialist if no improvement."
  }
}', 
(SELECT id FROM auth.users LIMIT 1), true, true, 1, 'silverman_clinic');

-- Store patient IDs for SOAP notes
DO $$
DECLARE
    michael_id uuid;
    sarah_id uuid;
    emma_id uuid;
BEGIN
    -- Get patient IDs
    SELECT id INTO michael_id FROM public.patients WHERE first_name = 'Michael' AND last_name = 'Rodriguez';
    SELECT id INTO sarah_id FROM public.patients WHERE first_name = 'Sarah' AND last_name = 'Chen';
    SELECT id INTO emma_id FROM public.patients WHERE first_name = 'Emma' AND last_name = 'Thompson';

    -- Insert comprehensive SOAP notes showcasing all features
    INSERT INTO public.soap_notes (id, patient_id, provider_id, provider_name, appointment_id, date_of_service, chief_complaint, is_draft, subjective_data, objective_data, assessment_data, plan_data, vital_signs, created_by, last_modified_by) VALUES

    -- Michael Rodriguez - Sports Injury (Knee)
    (gen_random_uuid(), michael_id, (SELECT id FROM auth.users LIMIT 1), 'Dr. Sarah Silverman', NULL, '2024-01-15 10:00:00', 'Right knee pain and swelling after soccer injury', false,
    '{
      "historyOfPresentIllness": "22-year-old male soccer player presents with acute onset right knee pain after landing awkwardly during practice 3 days ago. Reports hearing a pop at time of injury. Pain is 7/10, sharp with movement, aching at rest.",
      "painAssessment": {
        "currentPainLevel": 7,
        "averagePainLevel": 6,
        "worstPainLevel": 9,
        "painScale": "numeric",
        "location": ["right knee", "medial aspect"],
        "quality": ["sharp", "aching"],
        "triggers": ["weight bearing", "twisting movements", "stairs"],
        "relievingFactors": ["rest", "ice", "elevation"],
        "timePattern": "constant with exacerbations",
        "description": "Sharp shooting pain with movement, constant ache at rest",
        "functionalImpact": "Unable to participate in sports, difficulty with stairs and prolonged walking"
      },
      "reviewOfSystems": {
        "constitutional": "Denies fever, chills, weight loss",
        "musculoskeletal": "Right knee pain and swelling, no other joint involvement"
      },
      "allergies": "NKDA",
      "medications": "Ibuprofen 600mg TID",
      "socialHistory": "College soccer player, non-smoker, occasional alcohol use"
    }',
    '{
      "vitalSigns": {
        "height": "180 cm",
        "weight": "75 kg",
        "bloodPressure": "118/72",
        "heartRate": 68,
        "temperature": 98.4,
        "oxygenSaturation": 99,
        "respiratoryRate": 16,
        "bmi": 23.1
      },
      "systemExams": [
        {
          "system": "Musculoskeletal",
          "status": "abnormal",
          "refused": false,
          "notes": "Right knee: Moderate effusion, tenderness over medial joint line. Limited ROM: flexion 90 degrees (normal 135). Positive McMurray test, negative Lachman."
        }
      ],
      "specialTests": [
        {
          "name": "McMurray Test",
          "result": "positive",
          "notes": "Positive for medial meniscus tear"
        },
        {
          "name": "Lachman Test",
          "result": "negative",
          "notes": "No anterior cruciate ligament laxity"
        }
      ],
      "imagingLab": [
        {
          "type": "MRI",
          "name": "Right Knee MRI",
          "date": "2024-01-16",
          "results": "Pending - ordered to rule out meniscal tear"
        }
      ]
    }',
    '{
      "diagnoses": [
        {
          "code": "S83.2",
          "description": "Meniscus tear, unspecified"
        },
        {
          "code": "M25.461",
          "description": "Effusion, right knee"
        }
      ],
      "clinicalImpression": "Acute right knee injury with suspected medial meniscus tear based on mechanism of injury and positive McMurray test. MRI pending for confirmation."
    }',
    '{
      "treatments": ["Rest", "Ice 20 minutes every 2-3 hours", "Compression", "Elevation", "Physical therapy"],
      "medications": [
        {
          "genericName": "Ibuprofen",
          "brandName": "Advil",
          "strength": "600mg",
          "quantity": "60",
          "frequency": "Three times daily with food",
          "refills": "1",
          "diagnosisCode": "S83.2",
          "ePrescribing": false
        }
      ],
      "followUp": "2 weeks or sooner if symptoms worsen",
      "emergencyDisclaimer": true,
      "legalTags": ["Workers Compensation"],
      "additionalInstructions": "No weight bearing activities until follow-up. Begin gentle range of motion exercises as tolerated. Ice for 20 minutes every 2-3 hours. Return if increased pain, swelling, or inability to bear weight."
    }',
    '{
      "height": "180 cm",
      "weight": "75 kg",
      "bloodPressure": "118/72",
      "heartRate": 68,
      "temperature": 98.4,
      "oxygenSaturation": 99,
      "respiratoryRate": 16,
      "bmi": 23.1
    }',
    (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),

    -- Sarah Chen - Chronic Lower Back Pain
    (gen_random_uuid(), sarah_id, (SELECT id FROM auth.users LIMIT 1), 'Dr. Michael Thompson', NULL, '2024-01-18 14:30:00', 'Chronic lower back pain, worsening over past month', false,
    '{
      "historyOfPresentIllness": "45-year-old office worker with 3-year history of intermittent lower back pain, significantly worse over past month. Pain is 6/10, described as deep aching with sharp exacerbations. Worse with prolonged sitting, better with movement.",
      "painAssessment": {
        "currentPainLevel": 6,
        "averagePainLevel": 5,
        "worstPainLevel": 8,
        "painScale": "faces",
        "location": ["lower back", "bilateral", "radiating to right leg"],
        "quality": ["aching", "sharp", "burning"],
        "triggers": ["prolonged sitting", "forward bending", "coughing"],
        "relievingFactors": ["walking", "heat therapy", "lying down"],
        "timePattern": "worse morning and evening",
        "description": "Deep aching pain with sharp shooting episodes down right leg",
        "functionalImpact": "Difficulty with prolonged sitting at work, sleep disruption, limited exercise tolerance"
      },
      "reviewOfSystems": {
        "constitutional": "Denies fever, weight loss",
        "neurological": "Occasional numbness in right foot",
        "musculoskeletal": "Lower back pain with right leg radiation"
      },
      "allergies": "Codeine - nausea",
      "medications": "Naproxen 220mg BID, Acetaminophen 500mg PRN",
      "socialHistory": "Desk job, minimal exercise, former smoker (quit 2 years ago)"
    }',
    '{
      "vitalSigns": {
        "height": "165 cm",
        "weight": "68 kg",
        "bloodPressure": "128/82",
        "heartRate": 76,
        "temperature": 98.2,
        "oxygenSaturation": 98,
        "respiratoryRate": 18,
        "bmi": 25.0
      },
      "systemExams": [
        {
          "system": "Musculoskeletal",
          "status": "abnormal",
          "refused": false,
          "notes": "Lumbar spine: Decreased lordosis, paravertebral muscle spasm L4-S1. Limited forward flexion (50% of normal). Positive straight leg raise at 45 degrees right side."
        },
        {
          "system": "Neurological",
          "status": "abnormal",
          "refused": false,
          "notes": "Decreased sensation to light touch over right L5 dermatome. Normal motor strength all extremities. Reflexes: diminished right Achilles reflex."
        }
      ],
      "specialTests": [
        {
          "name": "Straight Leg Raise",
          "result": "positive",
          "notes": "Positive at 45 degrees on right, reproduces leg pain"
        }
      ],
      "imagingLab": [
        {
          "type": "X-ray",
          "name": "Lumbar Spine X-ray",
          "date": "2024-01-10",
          "results": "Mild degenerative changes L4-L5, no acute fracture"
        }
      ]
    }',
    '{
      "diagnoses": [
        {
          "code": "M54.5",
          "description": "Low back pain"
        },
        {
          "code": "M51.1",
          "description": "Lumbar disc disorder with radiculopathy"
        }
      ],
      "clinicalImpression": "Chronic lumbar disc disease with right L5 radiculopathy. Clinical findings consistent with L4-L5 disc involvement. Consider MRI if conservative treatment fails."
    }',
    '{
      "treatments": ["Physical therapy", "Heat therapy", "Ergonomic workplace assessment", "Core strengthening exercises"],
      "medications": [
        {
          "genericName": "Meloxicam",
          "brandName": "Mobic",
          "strength": "15mg",
          "quantity": "30",
          "frequency": "Once daily with food",
          "refills": "2",
          "diagnosisCode": "M54.5",
          "ePrescribing": true
        },
        {
          "genericName": "Cyclobenzaprine",
          "brandName": "Flexeril",
          "strength": "10mg",
          "quantity": "30",
          "frequency": "Bedtime as needed for muscle spasm",
          "refills": "1",
          "diagnosisCode": "M54.5",
          "ePrescribing": true
        }
      ],
      "followUp": "4 weeks",
      "emergencyDisclaimer": true,
      "legalTags": ["Disability Documentation"],
      "additionalInstructions": "Continue physical therapy 3x weekly. Apply heat 20 minutes BID. Avoid prolonged sitting >30 minutes. Return sooner if numbness/weakness increases."
    }',
    '{
      "height": "165 cm",
      "weight": "68 kg",
      "bloodPressure": "128/82",
      "heartRate": 76,
      "temperature": 98.2,
      "oxygenSaturation": 98,
      "respiratoryRate": 18,
      "bmi": 25.0
    }',
    (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1)),

    -- Emma Thompson - Pediatric Asthma (DRAFT)
    (gen_random_uuid(), emma_id, (SELECT id FROM auth.users LIMIT 1), 'Dr. Lisa Pediatric', NULL, '2024-01-22 11:00:00', 'Asthma follow-up and medication adjustment', true,
    '{
      "historyOfPresentIllness": "9-year-old female with mild persistent asthma presents for routine follow-up. Mother reports increased wheezing and nighttime cough over past 2 weeks, especially with cold weather.",
      "painAssessment": {
        "currentPainLevel": 0,
        "averagePainLevel": 0,
        "worstPainLevel": 2,
        "painScale": "faces",
        "location": ["chest"],
        "quality": ["tight"],
        "triggers": ["cold air", "exercise", "allergens"],
        "relievingFactors": ["bronchodilator", "warm environment"],
        "timePattern": "worse at night and early morning",
        "description": "Chest tightness with breathing difficulty, no significant pain",
        "functionalImpact": "Occasional limitation of physical activities at school"
      },
      "reviewOfSystems": {
        "respiratory": "Increased cough, wheeze, chest tightness. No fever.",
        "allergic": "Known environmental allergies to dust, pollen"
      },
      "allergies": "Environmental: dust, pollen. No drug allergies known.",
      "medications": "Albuterol inhaler PRN, Budesonide/Formoterol 160/4.5 mcg BID"
    }',
    '{
      "vitalSigns": {
        "height": "132 cm",
        "weight": "28 kg",
        "bloodPressure": "98/62",
        "heartRate": 88,
        "temperature": 98.6,
        "oxygenSaturation": 96,
        "respiratoryRate": 22,
        "bmi": 16.1
      },
      "systemExams": [
        {
          "system": "Respiratory",
          "status": "abnormal",
          "refused": false,
          "notes": "Mild expiratory wheeze bilateral lower lobes. Good air entry. No retractions or accessory muscle use."
        }
      ],
      "specialTests": [
        {
          "name": "Peak Flow",
          "result": "280 L/min",
          "notes": "85% of personal best (330 L/min)"
        }
      ]
    }',
    '{
      "diagnoses": [
        {
          "code": "J45.0",
          "description": "Allergic asthma"
        }
      ],
      "clinicalImpression": "Mild persistent asthma with suboptimal control. Consider step-up therapy."
    }',
    '{}',
    '{
      "height": "132 cm",
      "weight": "28 kg",
      "bloodPressure": "98/62",
      "heartRate": 88,
      "temperature": 98.6,
      "oxygenSaturation": 96,
      "respiratoryRate": 22,
      "bmi": 16.1
    }',
    (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1));

END $$;