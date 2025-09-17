export interface MockSOAPNote {
  id: string;
  patient_id: string;
  patient_name: string;
  visit_date: string;
  visit_type: string;
  provider_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  soap_data: {
    subjective: {
      symptoms: string[];
      pain_scale: number;
      pain_description: string;
      other_symptoms: string;
    };
    objective: {
      vital_signs: {
        height: string;
        weight: string;
        blood_pressure: string;
        heart_rate: string;
        temperature: string;
      };
      physical_exam: string;
      tests_performed: string[];
    };
    assessment: {
      primary_diagnosis: string;
      secondary_diagnoses: string[];
      clinical_impression: string;
    };
    plan: {
      treatments: string[];
      medications: string[];
      follow_up: string;
      instructions: string;
    };
  };
}

export const mockSOAPNotes: MockSOAPNote[] = [
  {
    id: "soap-1",
    patient_id: "1",
    patient_name: "Maria Rodriguez",
    visit_date: "2024-01-22",
    visit_type: "Initial Consultation",
    provider_name: "Dr. Sarah Johnson",
    status: "completed",
    created_at: "2024-01-22T09:00:00Z",
    updated_at: "2024-01-22T10:30:00Z",
    soap_data: {
      subjective: {
        symptoms: ["Lower back pain", "Muscle stiffness", "Limited mobility"],
        pain_scale: 7,
        pain_description: "Sharp, shooting pain radiating down left leg, worse in morning and after sitting",
        other_symptoms: "Occasional numbness in toes, sleep disturbances"
      },
      objective: {
        vital_signs: {
          height: "5'6\"",
          weight: "145 lbs",
          blood_pressure: "125/80",
          heart_rate: "72 bpm",
          temperature: "98.6°F"
        },
        physical_exam: "Decreased lumbar lordosis, tender L4-L5 region, positive straight leg raise test",
        tests_performed: ["Range of Motion Assessment", "Neurological Exam", "Orthopedic Tests"]
      },
      assessment: {
        primary_diagnosis: "L4-L5 disc herniation with radiculopathy",
        secondary_diagnoses: ["Lumbar muscle strain", "Postural dysfunction"],
        clinical_impression: "34-year-old female with acute disc herniation causing radicular symptoms following MVA"
      },
      plan: {
        treatments: ["Physical therapy 3x/week", "Chiropractic manipulation", "Heat/cold therapy"],
        medications: ["Ibuprofen 600mg TID", "Cyclobenzaprine 10mg QHS"],
        follow_up: "Return in 2 weeks for progress evaluation",
        instructions: "Avoid heavy lifting, apply ice 15-20 minutes every 2-3 hours"
      }
    }
  },
  {
    id: "soap-2",
    patient_id: "2",
    patient_name: "James Thompson",
    visit_date: "2024-01-20",
    visit_type: "Follow-up",
    provider_name: "Dr. Michael Chen",
    status: "completed",
    created_at: "2024-01-20T14:00:00Z",
    updated_at: "2024-01-20T15:15:00Z",
    soap_data: {
      subjective: {
        symptoms: ["Neck pain", "Headaches", "Shoulder stiffness"],
        pain_scale: 6,
        pain_description: "Constant aching in neck with intermittent sharp pain, headaches 3-4x/week",
        other_symptoms: "Difficulty concentrating, sleep disturbances"
      },
      objective: {
        vital_signs: {
          height: "6'1\"",
          weight: "185 lbs",
          blood_pressure: "130/85",
          heart_rate: "68 bpm",
          temperature: "98.4°F"
        },
        physical_exam: "Decreased cervical lordosis, muscle spasm in upper trapezius, diminished C6 sensation",
        tests_performed: ["Spurling's Test", "Cervical Compression Test", "Neurological Assessment"]
      },
      assessment: {
        primary_diagnosis: "Cervicalgia with radiculopathy",
        secondary_diagnoses: ["Tension headaches", "Muscle strain"],
        clinical_impression: "45-year-old male with cervical strain and radicular symptoms from workplace injury"
      },
      plan: {
        treatments: ["Cervical manipulation 3x/week", "Massage therapy", "Ergonomic evaluation"],
        medications: ["Naproxen 500mg BID", "Methocarbamol 750mg TID"],
        follow_up: "Return in 1 week, consider MRI if no improvement",
        instructions: "Use cervical pillow, perform gentle neck stretches, workplace modifications"
      }
    }
  },
  {
    id: "soap-3",
    patient_id: "3",
    patient_name: "Linda Davis",
    visit_date: "2024-01-21",
    visit_type: "Emergency Consultation",
    provider_name: "Dr. Sarah Johnson",
    status: "completed",
    created_at: "2024-01-21T16:30:00Z",
    updated_at: "2024-01-21T17:45:00Z",
    soap_data: {
      subjective: {
        symptoms: ["Severe knee pain", "Swelling", "Inability to bear weight"],
        pain_scale: 8,
        pain_description: "Sharp pain on medial knee, clicking sound, feels unstable",
        other_symptoms: "Knee locking sensation, significant swelling since injury"
      },
      objective: {
        vital_signs: {
          height: "5'4\"",
          weight: "125 lbs",
          blood_pressure: "110/70",
          heart_rate: "64 bpm",
          temperature: "98.2°F"
        },
        physical_exam: "Moderate effusion, tenderness over medial joint line, limited ROM, antalgic gait",
        tests_performed: ["McMurray Test", "Lachman Test", "Valgus Stress Test", "Knee Aspiration"]
      },
      assessment: {
        primary_diagnosis: "Medial meniscus tear with MCL sprain",
        secondary_diagnoses: ["Joint effusion", "Gait dysfunction"],
        clinical_impression: "31-year-old athlete with acute knee injury requiring orthopedic evaluation"
      },
      plan: {
        treatments: ["RICE protocol", "Non-weight bearing", "Physical therapy evaluation"],
        medications: ["Meloxicam 15mg daily", "Acetaminophen 650mg QID PRN"],
        follow_up: "Orthopedic consultation within 48 hours, return in 1 week",
        instructions: "Crutches for ambulation, knee brace for support, ice 20 minutes every 2 hours"
      }
    }
  },
  {
    id: "soap-4",
    patient_id: "4",
    patient_name: "Robert Martinez",
    visit_date: "2024-01-19",
    visit_type: "Chronic Pain Management",
    provider_name: "Dr. Emily Rodriguez",
    status: "completed",
    created_at: "2024-01-19T11:00:00Z",
    updated_at: "2024-01-19T12:00:00Z",
    soap_data: {
      subjective: {
        symptoms: ["Chronic shoulder pain", "Stiffness", "Night pain"],
        pain_scale: 5,
        pain_description: "Deep aching pain worsening over 6 months, worse at night",
        other_symptoms: "Difficulty reaching overhead, progressive weakness"
      },
      objective: {
        vital_signs: {
          height: "5'9\"",
          weight: "195 lbs",
          blood_pressure: "145/90",
          heart_rate: "76 bpm",
          temperature: "98.8°F"
        },
        physical_exam: "Limited active ROM, positive impingement signs, weakness in external rotation",
        tests_performed: ["Neer Test", "Hawkins-Kennedy Test", "Empty Can Test"]
      },
      assessment: {
        primary_diagnosis: "Rotator cuff impingement syndrome",
        secondary_diagnoses: ["Subacromial bursitis", "Type 2 diabetes mellitus"],
        clinical_impression: "58-year-old diabetic male with chronic shoulder impingement and partial tear"
      },
      plan: {
        treatments: ["Physical therapy 2x/week", "Corticosteroid injection", "Activity modification"],
        medications: ["Diclofenac gel 1% TID", "Tramadol 50mg BID PRN"],
        follow_up: "Return in 3 weeks post-injection, coordinate with endocrinologist",
        instructions: "Avoid overhead activities, monitor blood glucose, apply ice after exercises"
      }
    }
  },
  {
    id: "soap-5",
    patient_id: "5",
    patient_name: "Amanda Wilson",
    visit_date: "2024-01-23",
    visit_type: "Postpartum Assessment",
    provider_name: "Dr. Lisa Thompson",
    status: "completed",
    created_at: "2024-01-23T10:00:00Z",
    updated_at: "2024-01-23T11:15:00Z",
    soap_data: {
      subjective: {
        symptoms: ["Lower back pain", "Pelvic pain", "Hip discomfort"],
        pain_scale: 6,
        pain_description: "Dull constant ache since delivery 6 weeks ago, worse with standing",
        other_symptoms: "Sleep difficulties, muscle tension, occasional shooting leg pain"
      },
      objective: {
        vital_signs: {
          height: "5'7\"",
          weight: "158 lbs",
          blood_pressure: "118/75",
          heart_rate: "78 bpm",
          temperature: "98.5°F"
        },
        physical_exam: "Increased lumbar lordosis, tender SI joints, diastasis recti present",
        tests_performed: ["FABER Test", "Pelvic Floor Assessment", "Postural Analysis"]
      },
      assessment: {
        primary_diagnosis: "Postpartum musculoskeletal dysfunction",
        secondary_diagnoses: ["Diastasis recti", "Pelvic floor weakness", "SI joint dysfunction"],
        clinical_impression: "35-year-old postpartum female with pregnancy-related musculoskeletal changes"
      },
      plan: {
        treatments: ["Postpartum PT 2x/week", "Gentle chiropractic care", "Core strengthening"],
        medications: ["Ibuprofen 600mg TID PRN", "Magnesium supplement"],
        follow_up: "Return in 2 weeks for progress evaluation",
        instructions: "Proper lifting mechanics, pelvic floor exercises, gradual activity increase"
      }
    }
  }
];