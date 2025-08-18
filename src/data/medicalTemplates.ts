export interface MedicalTemplate {
  id: string;
  name: string;
  category: string;
  specialty: string;
  description: string;
  icon: string;
  keywords: string[];
  icd10Codes: string[];
  cptCodes: string[];
  ageGroups: ('pediatric' | 'adult' | 'geriatric')[];
  gender?: 'male' | 'female';
  urgencyLevel: 'low' | 'medium' | 'high';
  template: {
    subjective: {
      chiefComplaint: string;
      historyOfPresentIllness: string;
      reviewOfSystems: string[];
      pastMedicalHistory: string[];
      medications: string[];
      allergies: string[];
      socialHistory: string[];
      familyHistory: string[];
    };
    objective: {
      vitalSigns: string[];
      physicalExam: string[];
      diagnosticTests: string[];
    };
    assessment: {
      primaryDiagnosis: string;
      differentialDiagnoses: string[];
      clinicalImpression: string;
    };
    plan: {
      treatments: string[];
      medications: string[];
      diagnostics: string[];
      followUp: string[];
      patientEducation: string[];
      preventiveCare: string[];
    };
  };
  // Enhanced for chiropractic data - matches ChiropracticSubjectiveData and ChiropracticObjectiveData
  chiropracticTemplate?: {
    subjective: {
      mainComplaints: string[];
      otherComplaint: string;
      problemStart: string;
      problemBegin: string;
      painRating: number[];
      painBetter: string;
      painWorse: string;
      painDescriptions: string[];
      painRadiate: string;
      painFrequency: string[];
      otherSymptoms: string;
      medications: string;
      reviewOfSystems: {
        neurological: { [key: string]: string };
        cardiovascular: { [key: string]: string };
        respiratory: { [key: string]: string };
        musculoskeletal: { [key: string]: string };
        gastrointestinal: { [key: string]: string };
        genitourinary: { [key: string]: string };
        endocrine: { [key: string]: string };
        skinImmune: { [key: string]: string };
        mentalHealth: { [key: string]: string };
        notes: {
          neurological: string;
          cardiovascular: string;
          respiratory: string;
          musculoskeletal: string;
          gastrointestinal: string;
          genitourinary: string;
          endocrine: string;
          skinImmune: string;
          mentalHealth: string;
        };
      };
    };
    objective: {
      posture: string[];
      gait: string[];
      gaitOther: string;
      muscleTone: string;
      tenderness: string;
      triggerPoints: string;
      jointFixation: string;
      edema: string;
      edemaLocation: string;
      reflexes: string;
      sensation: string;
      sensationLocation: string;
      strength: string;
      strengthMuscle: string;
      vitalSigns: {
        bp: string;
        hr: string;
        resp: string;
        temp: string;
        height: string;
        weight: string;
        oxygenSaturation: string;
      };
      rangeOfMotion: {
        cervical: {
          flexion: string;
          extension: string;
          rotation: string;
          lateralFlexion: string;
        };
        thoracic: {
          rotation: string;
          flexionExtension: string;
        };
        lumbar: {
          flexion: string;
          extension: string;
          lateralFlexion: string;
          rotation: string;
        };
      };
      orthopedicTests: {
        slr: string;
        slrAngle: string;
        kemps: string;
        kempsSide: string;
        faber: string;
        faberSide: string;
        yeoman: string;
        otherTests: string;
      };
    };
  };
  redFlags: string[];
  clinicalPearls: string[];
}

export const medicalTemplateCategories = [
  'Musculoskeletal',
  'Neurological', 
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Dermatological',
  'Endocrine',
  'Genitourinary',
  'Mental Health',
  'ENT',
  'Ophthalmology',
  'Emergency',
  'Preventive Care',
  'General Assessment',
  'Chiropractic'
];

export const medicalTemplates: MedicalTemplate[] = [
  // Musculoskeletal Templates
  {
    id: 'lower-back-pain',
    name: 'Lower Back Pain',
    category: 'Musculoskeletal',
    specialty: 'Orthopedics',
    description: 'Comprehensive assessment for acute and chronic lower back pain',
    icon: '🦴',
    keywords: ['back pain', 'lumbar', 'sciatica', 'herniated disc', 'muscle strain'],
    icd10Codes: ['M54.5', 'M51.16', 'M62.830'],
    cptCodes: ['99213', '72148', '72158'],
    ageGroups: ['adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with lower back pain',
        historyOfPresentIllness: 'Location, onset, duration, character, radiation, timing, exacerbating/alleviating factors, severity',
        reviewOfSystems: ['Neurological deficits', 'Bowel/bladder dysfunction', 'Fever', 'Weight loss'],
        pastMedicalHistory: ['Previous back injuries', 'Arthritis', 'Osteoporosis'],
        medications: ['Current pain medications', 'Anti-inflammatories'],
        allergies: ['Drug allergies'],
        socialHistory: ['Occupation', 'Physical activity level', 'Smoking'],
        familyHistory: ['Spinal disorders', 'Arthritis']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Temp', 'Pain scale'],
        physicalExam: ['Inspection', 'Palpation', 'Range of motion', 'Straight leg raise', 'Neurological exam'],
        diagnosticTests: ['X-ray lumbar spine', 'MRI if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Lower back pain, unspecified',
        differentialDiagnoses: ['Lumbar strain', 'Disc herniation', 'Facet joint dysfunction', 'Spinal stenosis'],
        clinicalImpression: 'Mechanical lower back pain without red flags'
      },
      plan: {
        treatments: ['Physical therapy', 'Heat/ice therapy', 'Activity modification'],
        medications: ['NSAIDs', 'Muscle relaxants if indicated'],
        diagnostics: ['Consider imaging if no improvement in 4-6 weeks'],
        followUp: ['2-4 weeks or sooner if worsening'],
        patientEducation: ['Proper body mechanics', 'Exercise program', 'When to seek immediate care'],
        preventiveCare: ['Core strengthening', 'Ergonomic assessment']
      }
    },
    chiropracticTemplate: {
      subjective: {
        mainComplaints: ['Low back'],
        otherComplaint: '',
        problemStart: '1 week ago',
        problemBegin: 'Gradual',
        painRating: [6],
        painBetter: 'Rest, heat therapy',
        painWorse: 'Prolonged sitting, forward bending',
        painDescriptions: ['Achy', 'Dull'],
        painRadiate: 'No radiation',
        painFrequency: ['Intermittent'],
        otherSymptoms: 'Lower back stiffness',
        medications: 'Ibuprofen as needed',
        reviewOfSystems: {
          neurological: { 'Headaches': 'no', 'Dizziness': 'no', 'Numbness': 'no', 'Weakness': 'no', 'Tremors': 'no', 'Memory issues': 'no' },
          cardiovascular: { 'Chest pain': 'no', 'Palpitations': 'no', 'Swelling': 'no', 'Shortness of breath': 'no', 'High blood pressure': 'no' },
          respiratory: { 'Cough': 'no', 'Wheezing': 'no', 'Breathing difficulties': 'no', 'Asthma': 'no' },
          musculoskeletal: { 'Joint pain': 'yes', 'Stiffness': 'yes', 'Swelling': 'no', 'Muscle weakness': 'no', 'Previous injuries': 'no' },
          gastrointestinal: { 'Poor appetite': 'no', 'Nausea': 'no', 'Bowel changes': 'no', 'Abdominal pain': 'no' },
          genitourinary: { 'Frequent urination': 'no', 'Urgency': 'no', 'Pain with urination': 'no', 'Reproductive issues': 'no' },
          endocrine: { 'Fatigue': 'no', 'Weight changes': 'no', 'Temperature sensitivity': 'no', 'Excessive thirst': 'no' },
          skinImmune: { 'Rashes': 'no', 'Allergies': 'no', 'Frequent infections': 'no', 'Poor healing': 'no' },
          mentalHealth: { 'Mood changes': 'no', 'Sleep problems': 'no', 'Anxiety': 'no', 'High stress levels': 'no' },
          notes: {
            neurological: '',
            cardiovascular: '',
            respiratory: '',
            musculoskeletal: 'Lower back stiffness and pain',
            gastrointestinal: '',
            genitourinary: '',
            endocrine: '',
            skinImmune: '',
            mentalHealth: ''
          }
        }
      },
      objective: {
        posture: ['Forward Head'],
        gait: ['Normal'],
        gaitOther: '',
        muscleTone: 'Increased tension in lumbar paraspinals',
        tenderness: 'L4-L5 paraspinal muscles',
        triggerPoints: 'Active trigger points in quadratus lumborum',
        jointFixation: 'L4-L5 segment restriction',
        edema: 'None',
        edemaLocation: '',
        reflexes: 'Normal and symmetrical',
        sensation: 'Intact',
        sensationLocation: '',
        strength: '5/5 all movements',
        strengthMuscle: 'Hip flexors, extensors',
        vitalSigns: {
          bp: '120/80',
          hr: '72',
          resp: '16',
          temp: '98.6',
          height: '',
          weight: '',
          oxygenSaturation: '99'
        },
        rangeOfMotion: {
          cervical: {
            flexion: '',
            extension: '',
            rotation: '',
            lateralFlexion: ''
          },
          thoracic: {
            rotation: '',
            flexionExtension: ''
          },
          lumbar: {
            flexion: '45°',
            extension: '15°',
            lateralFlexion: '20°',
            rotation: '15°'
          }
        },
        orthopedicTests: {
          slr: 'negative',
          slrAngle: '70°',
          kemps: 'positive',
          kempsSide: 'right',
          faber: 'negative',
          faberSide: '',
          yeoman: 'negative',
          otherTests: 'Straight leg raise negative bilaterally, Kemp\'s test positive right'
        }
      }
    },
    redFlags: ['Bowel/bladder dysfunction', 'Progressive neurological deficits', 'Fever with back pain', 'History of cancer'],
    clinicalPearls: ['Most back pain resolves within 6 weeks', 'Avoid bed rest beyond 2-3 days', 'Early mobilization improves outcomes']
  },
  {
    id: 'knee-pain',
    name: 'Knee Pain Assessment',
    category: 'Musculoskeletal',
    specialty: 'Orthopedics',
    description: 'Evaluation of acute and chronic knee pain',
    icon: '🦵',
    keywords: ['knee pain', 'meniscus', 'ACL', 'arthritis', 'patella'],
    icd10Codes: ['M25.561', 'M23.205', 'S83.519A'],
    cptCodes: ['99213', '73721', '29881'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with knee pain',
        historyOfPresentIllness: 'Mechanism of injury, onset, location, swelling, locking, giving way',
        reviewOfSystems: ['Joint stiffness', 'Swelling', 'Instability', 'Mechanical symptoms'],
        pastMedicalHistory: ['Previous knee injuries', 'Arthritis', 'Gout'],
        medications: ['Pain medications', 'Anti-inflammatories'],
        allergies: ['Drug allergies'],
        socialHistory: ['Activity level', 'Sports participation', 'Occupation'],
        familyHistory: ['Arthritis', 'Joint disorders']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Pain scale'],
        physicalExam: ['Inspection', 'Palpation', 'Range of motion', 'Ligament tests', 'Meniscal tests'],
        diagnosticTests: ['X-ray knee', 'MRI if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Knee pain, unspecified',
        differentialDiagnoses: ['Meniscal tear', 'Ligament injury', 'Osteoarthritis', 'Patellofemoral syndrome'],
        clinicalImpression: 'Knee pain requiring further evaluation'
      },
      plan: {
        treatments: ['Rest', 'Ice', 'Compression', 'Elevation', 'Physical therapy'],
        medications: ['NSAIDs', 'Topical analgesics'],
        diagnostics: ['X-ray', 'MRI if mechanical symptoms'],
        followUp: ['2-4 weeks or sooner if worsening'],
        patientEducation: ['Activity modification', 'Weight management', 'Strengthening exercises'],
        preventiveCare: ['Quadriceps strengthening', 'Proper footwear']
      }
    },
    redFlags: ['Inability to bear weight', 'Severe deformity', 'Neurovascular compromise', 'Signs of infection'],
    clinicalPearls: ['Ottawa knee rules for imaging', 'Effusion suggests intra-articular pathology', 'Consider referred pain from hip']
  },

  // Cardiovascular Templates
  {
    id: 'chest-pain',
    name: 'Chest Pain Evaluation',
    category: 'Cardiovascular',
    specialty: 'Cardiology',
    description: 'Comprehensive assessment for chest pain with cardiac risk stratification',
    icon: '❤️',
    keywords: ['chest pain', 'angina', 'heart attack', 'cardiac', 'myocardial infarction'],
    icd10Codes: ['R06.02', 'I25.9', 'I20.9'],
    cptCodes: ['99214', '93000', '93015'],
    ageGroups: ['adult', 'geriatric'],
    urgencyLevel: 'high',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with chest pain',
        historyOfPresentIllness: 'OPQRST analysis: Onset, Provocation, Quality, Region/Radiation, Severity, Timing',
        reviewOfSystems: ['Shortness of breath', 'Nausea', 'Diaphoresis', 'Palpitations', 'Syncope'],
        pastMedicalHistory: ['CAD', 'HTN', 'DM', 'Hyperlipidemia', 'Previous MI'],
        medications: ['Cardiac medications', 'Anticoagulants', 'Nitrates'],
        allergies: ['Drug allergies', 'Aspirin allergy'],
        socialHistory: ['Smoking', 'Alcohol', 'Cocaine use', 'Family history of CAD'],
        familyHistory: ['Premature CAD', 'Sudden cardiac death']
      },
      objective: {
        vitalSigns: ['BP both arms', 'HR', 'RR', 'O2 sat', 'Pain scale'],
        physicalExam: ['Cardiac exam', 'Pulmonary exam', 'Extremity exam', 'Vascular exam'],
        diagnosticTests: ['ECG', 'Chest X-ray', 'Cardiac enzymes', 'BNP/NT-proBNP']
      },
      assessment: {
        primaryDiagnosis: 'Chest pain, unspecified',
        differentialDiagnoses: ['Acute coronary syndrome', 'Angina', 'Aortic dissection', 'Pulmonary embolism', 'Costochondritis'],
        clinicalImpression: 'Chest pain requiring cardiac risk stratification'
      },
      plan: {
        treatments: ['Cardiac monitoring', 'Oxygen if hypoxic', 'IV access'],
        medications: ['Aspirin', 'Nitroglycerin', 'Beta-blockers if indicated'],
        diagnostics: ['Serial ECGs', 'Cardiac enzymes', 'Stress testing if appropriate'],
        followUp: ['Cardiology if high risk', 'Primary care if low risk'],
        patientEducation: ['When to seek emergency care', 'Risk factor modification'],
        preventiveCare: ['Smoking cessation', 'Diet modification', 'Exercise program']
      }
    },
    redFlags: ['ST elevation on ECG', 'Hemodynamic instability', 'Severe pain with diaphoresis', 'Signs of aortic dissection'],
    clinicalPearls: ['Use validated risk scores (HEART, TIMI)', 'Atypical presentations in women and diabetics', 'Consider PE in appropriate clinical context']
  },

  // Respiratory Templates
  {
    id: 'shortness-of-breath',
    name: 'Dyspnea Assessment',
    category: 'Respiratory',
    specialty: 'Pulmonology',
    description: 'Evaluation of acute and chronic shortness of breath',
    icon: '🫁',
    keywords: ['shortness of breath', 'dyspnea', 'SOB', 'breathing difficulty', 'respiratory'],
    icd10Codes: ['R06.02', 'J44.1', 'I50.9'],
    cptCodes: ['99213', '71046', '94010'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'high',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with shortness of breath',
        historyOfPresentIllness: 'Onset, triggers, exertional vs rest, orthopnea, PND, chest pain',
        reviewOfSystems: ['Cough', 'Sputum production', 'Wheezing', 'Chest pain', 'Leg swelling'],
        pastMedicalHistory: ['COPD', 'Asthma', 'CHF', 'PE', 'Pneumonia'],
        medications: ['Inhalers', 'Diuretics', 'ACE inhibitors'],
        allergies: ['Environmental allergens', 'Drug allergies'],
        socialHistory: ['Smoking history', 'Occupational exposures', 'Travel'],
        familyHistory: ['Asthma', 'COPD', 'Heart disease']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'RR', 'O2 sat', 'Peak flow if indicated'],
        physicalExam: ['Pulmonary exam', 'Cardiac exam', 'Extremity exam for edema', 'JVD assessment'],
        diagnosticTests: ['Chest X-ray', 'ABG if indicated', 'BNP', 'D-dimer']
      },
      assessment: {
        primaryDiagnosis: 'Dyspnea, unspecified',
        differentialDiagnoses: ['Asthma exacerbation', 'COPD exacerbation', 'CHF', 'Pneumonia', 'PE'],
        clinicalImpression: 'Acute dyspnea requiring evaluation'
      },
      plan: {
        treatments: ['Oxygen therapy', 'Bronchodilators', 'Positioning'],
        medications: ['Albuterol', 'Corticosteroids if indicated', 'Diuretics if CHF'],
        diagnostics: ['Chest imaging', 'Pulmonary function tests', 'Echo if cardiac cause'],
        followUp: ['Pulmonology or cardiology as indicated'],
        patientEducation: ['Proper inhaler technique', 'Action plan', 'When to seek care'],
        preventiveCare: ['Smoking cessation', 'Vaccinations', 'Exercise as tolerated']
      }
    },
    redFlags: ['Severe hypoxemia', 'Altered mental status', 'Hemodynamic instability', 'Signs of tension pneumothorax'],
    clinicalPearls: ['Consider PE in acute onset', 'BNP helps differentiate cardiac vs pulmonary', 'Peak flow useful in asthma']
  },

  // Neurological Templates
  {
    id: 'headache',
    name: 'Headache Evaluation',
    category: 'Neurological',
    specialty: 'Neurology',
    description: 'Comprehensive headache assessment and classification',
    icon: '🧠',
    keywords: ['headache', 'migraine', 'tension headache', 'cluster headache', 'cephalgia'],
    icd10Codes: ['G43.909', 'G44.209', 'R51.9'],
    cptCodes: ['99213', '70450', '70551'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with headache',
        historyOfPresentIllness: 'POUND features: Pulsating, One day duration, Unilateral, Nausea, Disabling',
        reviewOfSystems: ['Nausea/vomiting', 'Photophobia', 'Phonophobia', 'Aura', 'Fever'],
        pastMedicalHistory: ['Previous headaches', 'Migraines', 'Head trauma', 'HTN'],
        medications: ['Current analgesics', 'Prophylactic medications', 'Overuse patterns'],
        allergies: ['Drug allergies'],
        socialHistory: ['Stress levels', 'Sleep patterns', 'Caffeine intake', 'Alcohol use'],
        familyHistory: ['Migraines', 'Headache disorders']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Temp', 'Pain scale'],
        physicalExam: ['Neurological exam', 'Fundoscopic exam', 'Neck exam', 'Temporal artery exam'],
        diagnosticTests: ['CT head if red flags', 'MRI brain if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Headache, unspecified',
        differentialDiagnoses: ['Migraine', 'Tension-type headache', 'Cluster headache', 'Secondary headache'],
        clinicalImpression: 'Primary headache disorder vs secondary causes'
      },
      plan: {
        treatments: ['Abortive therapy', 'Prophylactic therapy if frequent'],
        medications: ['Triptans for migraine', 'NSAIDs', 'Preventive medications'],
        diagnostics: ['Imaging if red flags present', 'Headache diary'],
        followUp: ['Neurology if refractory', 'Primary care follow-up'],
        patientEducation: ['Trigger identification', 'Lifestyle modifications', 'When to seek care'],
        preventiveCare: ['Regular sleep', 'Stress management', 'Hydration']
      }
    },
    redFlags: ['Sudden severe headache', 'Headache with fever and neck stiffness', 'New headache >50 years', 'Progressive headache'],
    clinicalPearls: ['SNOOP red flags', 'Medication overuse headache common', 'Consider secondary causes in new patterns']
  },

  // Gastrointestinal Templates
  {
    id: 'abdominal-pain',
    name: 'Abdominal Pain Assessment',
    category: 'Gastrointestinal',
    specialty: 'Gastroenterology',
    description: 'Systematic evaluation of acute and chronic abdominal pain',
    icon: '🫃',
    keywords: ['abdominal pain', 'stomach pain', 'belly pain', 'appendicitis', 'gallbladder'],
    icd10Codes: ['R10.9', 'K35.9', 'K80.20'],
    cptCodes: ['99213', '74176', '76705'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with abdominal pain',
        historyOfPresentIllness: 'Location, onset, character, radiation, timing, exacerbating/alleviating factors',
        reviewOfSystems: ['Nausea/vomiting', 'Diarrhea', 'Constipation', 'Fever', 'Urinary symptoms'],
        pastMedicalHistory: ['Previous abdominal surgeries', 'GI disorders', 'Gallbladder disease'],
        medications: ['NSAIDs', 'Antibiotics', 'GI medications'],
        allergies: ['Drug allergies', 'Food allergies'],
        socialHistory: ['Diet', 'Alcohol use', 'Travel history'],
        familyHistory: ['GI cancers', 'IBD', 'Gallbladder disease']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Temp', 'Pain scale'],
        physicalExam: ['Abdominal exam', 'Bowel sounds', 'Rebound/guarding', 'Murphy\'s sign', 'Psoas sign'],
        diagnosticTests: ['CBC', 'CMP', 'Lipase', 'Urinalysis', 'CT abdomen if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Abdominal pain, unspecified',
        differentialDiagnoses: ['Appendicitis', 'Cholecystitis', 'Gastroenteritis', 'Bowel obstruction', 'UTI'],
        clinicalImpression: 'Acute abdominal pain requiring evaluation'
      },
      plan: {
        treatments: ['NPO if surgical abdomen suspected', 'IV fluids', 'Pain management'],
        medications: ['Analgesics', 'Anti-emetics', 'Antibiotics if indicated'],
        diagnostics: ['Laboratory studies', 'Imaging as appropriate'],
        followUp: ['Surgery if indicated', 'GI if chronic pain'],
        patientEducation: ['When to seek emergency care', 'Diet modifications'],
        preventiveCare: ['Dietary counseling', 'Weight management']
      }
    },
    redFlags: ['Peritoneal signs', 'Hemodynamic instability', 'Severe pain with vomiting', 'Signs of obstruction'],
    clinicalPearls: ['Pain migration suggests appendicitis', 'Murphy\'s sign for cholecystitis', 'Consider gynecologic causes in women']
  },

  // Dermatological Templates
  {
    id: 'skin-rash',
    name: 'Dermatological Assessment',
    category: 'Dermatological',
    specialty: 'Dermatology',
    description: 'Evaluation of skin rashes and dermatological conditions',
    icon: '🧴',
    keywords: ['rash', 'skin', 'dermatitis', 'eczema', 'psoriasis', 'hives'],
    icd10Codes: ['L30.9', 'L20.9', 'L40.9'],
    cptCodes: ['99213', '11100', '96900'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'low',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with skin rash',
        historyOfPresentIllness: 'Distribution, onset, progression, associated symptoms, triggers',
        reviewOfSystems: ['Itching', 'Pain', 'Fever', 'Joint pain', 'Systemic symptoms'],
        pastMedicalHistory: ['Previous skin conditions', 'Allergies', 'Autoimmune diseases'],
        medications: ['New medications', 'Topical treatments', 'Systemic medications'],
        allergies: ['Drug allergies', 'Contact allergens', 'Food allergies'],
        socialHistory: ['Occupational exposures', 'Pet exposure', 'Travel history'],
        familyHistory: ['Skin conditions', 'Autoimmune diseases', 'Allergies']
      },
      objective: {
        vitalSigns: ['Temp if systemic symptoms', 'Pain scale if applicable'],
        physicalExam: ['Skin examination', 'Distribution pattern', 'Morphology', 'Lymph node exam'],
        diagnosticTests: ['Skin biopsy if indicated', 'Patch testing', 'KOH prep']
      },
      assessment: {
        primaryDiagnosis: 'Skin rash, unspecified',
        differentialDiagnoses: ['Contact dermatitis', 'Eczema', 'Psoriasis', 'Drug eruption', 'Infection'],
        clinicalImpression: 'Dermatological condition requiring evaluation'
      },
      plan: {
        treatments: ['Topical therapy', 'Avoidance of triggers', 'Moisturization'],
        medications: ['Topical corticosteroids', 'Antihistamines', 'Systemic therapy if severe'],
        diagnostics: ['Biopsy if diagnosis uncertain', 'Allergy testing'],
        followUp: ['Dermatology if refractory', 'Primary care follow-up'],
        patientEducation: ['Skin care routine', 'Trigger avoidance', 'Proper medication use'],
        preventiveCare: ['Sun protection', 'Moisturization', 'Gentle skin care']
      }
    },
    redFlags: ['Stevens-Johnson syndrome', 'Cellulitis with systemic symptoms', 'Rapid progression', 'Mucosal involvement'],
    clinicalPearls: ['Pattern recognition key to diagnosis', 'Consider drug causes', 'Photo distribution suggests photosensitivity']
  },

  // Mental Health Templates
  {
    id: 'depression-screening',
    name: 'Depression Assessment',
    category: 'Mental Health',
    specialty: 'Psychiatry',
    description: 'Comprehensive depression screening and evaluation',
    icon: '🧠',
    keywords: ['depression', 'mood', 'sad', 'hopeless', 'mental health', 'anxiety'],
    icd10Codes: ['F32.9', 'F33.9', 'F41.1'],
    cptCodes: ['99213', '90834', '96116'],
    ageGroups: ['adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with mood concerns',
        historyOfPresentIllness: 'Duration, severity, functional impact, sleep changes, appetite changes',
        reviewOfSystems: ['Sleep disturbance', 'Appetite changes', 'Energy level', 'Concentration', 'Suicidal ideation'],
        pastMedicalHistory: ['Previous depression', 'Anxiety', 'Substance use', 'Medical conditions'],
        medications: ['Antidepressants', 'Anxiolytics', 'Other psychiatric medications'],
        allergies: ['Drug allergies'],
        socialHistory: ['Stressors', 'Support system', 'Substance use', 'Employment'],
        familyHistory: ['Depression', 'Suicide', 'Mental health conditions']
      },
      objective: {
        vitalSigns: ['Weight changes', 'Vital signs'],
        physicalExam: ['Mental status exam', 'Appearance', 'Mood', 'Affect', 'Thought process'],
        diagnosticTests: ['PHQ-9', 'GAD-7', 'Laboratory studies if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Major depressive disorder, unspecified',
        differentialDiagnoses: ['Adjustment disorder', 'Bipolar disorder', 'Anxiety disorder', 'Medical causes'],
        clinicalImpression: 'Depression requiring evaluation and treatment'
      },
      plan: {
        treatments: ['Psychotherapy', 'Medication management', 'Lifestyle modifications'],
        medications: ['SSRI/SNRI', 'Consider other classes if indicated'],
        diagnostics: ['Screening questionnaires', 'Lab work if indicated'],
        followUp: ['Psychiatry referral', 'Close follow-up for medication changes'],
        patientEducation: ['Depression education', 'Medication compliance', 'Crisis planning'],
        preventiveCare: ['Exercise', 'Sleep hygiene', 'Stress management']
      }
    },
    redFlags: ['Active suicidal ideation', 'Psychosis', 'Severe functional impairment', 'Substance abuse'],
    clinicalPearls: ['Screen for bipolar before starting antidepressants', 'Assess suicide risk at every visit', 'Combination therapy often most effective']
  },

  // Emergency Templates
  {
    id: 'trauma-assessment',
    name: 'Trauma Evaluation',
    category: 'Emergency',
    specialty: 'Emergency Medicine',
    description: 'Systematic trauma assessment using ATLS principles',
    icon: '🚨',
    keywords: ['trauma', 'accident', 'injury', 'fall', 'MVA', 'emergency'],
    icd10Codes: ['T07', 'S06.9X0A', 'S72.001A'],
    cptCodes: ['99285', '71045', '74176'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'high',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents following trauma',
        historyOfPresentIllness: 'Mechanism of injury, time of injury, loss of consciousness, amnesia',
        reviewOfSystems: ['Pain', 'Numbness', 'Weakness', 'Nausea', 'Visual changes'],
        pastMedicalHistory: ['Anticoagulation', 'Previous injuries', 'Medical conditions'],
        medications: ['Blood thinners', 'Current medications'],
        allergies: ['Drug allergies'],
        socialHistory: ['Substance use', 'Occupation', 'Activities'],
        familyHistory: ['Bleeding disorders']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'RR', 'O2 sat', 'Temp', 'GCS'],
        physicalExam: ['Primary survey ABCDE', 'Secondary survey head to toe', 'Neurological exam'],
        diagnosticTests: ['CT head', 'CT c-spine', 'Chest X-ray', 'Pelvis X-ray', 'FAST exam']
      },
      assessment: {
        primaryDiagnosis: 'Multiple injuries following trauma',
        differentialDiagnoses: ['Head injury', 'Spinal injury', 'Internal bleeding', 'Fractures'],
        clinicalImpression: 'Trauma patient requiring systematic evaluation'
      },
      plan: {
        treatments: ['Trauma protocol', 'C-spine immobilization', 'IV access', 'Pain management'],
        medications: ['Pain medications', 'Tetanus prophylaxis'],
        diagnostics: ['Imaging per trauma protocol', 'Laboratory studies'],
        followUp: ['Trauma surgery', 'Orthopedics', 'Neurosurgery as indicated'],
        patientEducation: ['Injury prevention', 'Follow-up care', 'Return precautions'],
        preventiveCare: ['Safety counseling', 'Fall prevention if applicable']
      }
    },
    redFlags: ['Hemodynamic instability', 'Altered mental status', 'Focal neurological deficits', 'Signs of internal bleeding'],
    clinicalPearls: ['ATLS primary survey first', 'Maintain c-spine precautions', 'Frequent reassessment essential']
  },

  // General Assessment
  {
    id: 'general-assessment',
    name: 'General Medical Assessment',
    category: 'General Assessment',
    specialty: 'Internal Medicine',
    description: 'Comprehensive general medical evaluation',
    icon: '🩺',
    keywords: ['general', 'assessment', 'evaluation', 'checkup', 'exam'],
    icd10Codes: ['Z00.00', 'R50.9', 'R53.83'],
    cptCodes: ['99213', '99214', '99215'],
    ageGroups: ['pediatric', 'adult', 'geriatric'],
    urgencyLevel: 'low',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents for evaluation',
        historyOfPresentIllness: 'Complete description of presenting concerns',
        reviewOfSystems: ['Constitutional', 'HEENT', 'Cardiovascular', 'Pulmonary', 'GI', 'GU', 'Musculoskeletal', 'Neurological', 'Psychiatric', 'Endocrine', 'Hematologic', 'Allergic/Immunologic'],
        pastMedicalHistory: ['Significant medical conditions', 'Surgeries', 'Hospitalizations'],
        medications: ['Current medications with dosages'],
        allergies: ['Drug allergies with reactions'],
        socialHistory: ['Smoking', 'Alcohol', 'Drugs', 'Occupation', 'Living situation'],
        familyHistory: ['Significant family medical history']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'RR', 'Temp', 'O2 sat', 'Height', 'Weight', 'BMI'],
        physicalExam: ['General appearance', 'HEENT', 'Neck', 'Cardiovascular', 'Pulmonary', 'Abdominal', 'Extremities', 'Neurological', 'Skin'],
        diagnosticTests: ['Laboratory studies as indicated', 'Imaging as appropriate']
      },
      assessment: {
        primaryDiagnosis: 'Medical evaluation',
        differentialDiagnoses: ['Based on presenting concerns'],
        clinicalImpression: 'Overall clinical assessment'
      },
      plan: {
        treatments: ['Treatments as indicated'],
        medications: ['Medications as appropriate'],
        diagnostics: ['Further testing as needed'],
        followUp: ['Appropriate follow-up care'],
        patientEducation: ['Relevant patient education'],
        preventiveCare: ['Age-appropriate screening', 'Vaccinations', 'Health maintenance']
      }
    },
    redFlags: ['Red flag symptoms based on presentation'],
    clinicalPearls: ['Adapt assessment to presenting concerns', 'Consider age-appropriate screening', 'Document thoroughly']
  },

  // Chiropractic Templates
  {
    id: 'chiropractic-neck-pain',
    name: 'Cervical Spine Pain',
    category: 'Chiropractic',
    specialty: 'Chiropractic',
    description: 'Comprehensive chiropractic assessment for neck pain and cervical spine conditions',
    icon: '🦴',
    keywords: ['neck pain', 'cervical', 'headache', 'stiffness', 'whiplash', 'torticollis'],
    icd10Codes: ['M54.2', 'M50.30', 'S13.4XXA'],
    cptCodes: ['98940', '98941', '99213'],
    ageGroups: ['adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with neck pain and stiffness',
        historyOfPresentIllness: 'Onset, duration, radiation to arms, headaches, mechanism of injury',
        reviewOfSystems: ['Headaches', 'Upper extremity symptoms', 'Dizziness', 'Visual disturbances'],
        pastMedicalHistory: ['Previous neck injuries', 'Arthritis', 'Degenerative disc disease'],
        medications: ['NSAIDs', 'Muscle relaxants', 'Pain medications'],
        allergies: ['Drug allergies'],
        socialHistory: ['Computer use', 'Pillow type', 'Sleep position', 'Stress levels'],
        familyHistory: ['Arthritis', 'Spinal disorders']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Pain scale'],
        physicalExam: ['Cervical ROM', 'Posture assessment', 'Palpation', 'Neurological exam', 'Orthopedic tests'],
        diagnosticTests: ['X-ray cervical spine', 'MRI if neurological symptoms']
      },
      assessment: {
        primaryDiagnosis: 'Cervical strain',
        differentialDiagnoses: ['Cervical facet dysfunction', 'Cervical disc derangement', 'Myofascial pain syndrome', 'Cervical radiculopathy'],
        clinicalImpression: 'Mechanical neck pain with restricted range of motion'
      },
      plan: {
        treatments: ['Chiropractic manipulation', 'Soft tissue therapy', 'Postural exercises', 'Ergonomic counseling'],
        medications: ['NSAIDs as needed', 'Topical analgesics'],
        diagnostics: ['Re-evaluate in 1-2 weeks', 'Advanced imaging if no improvement'],
        followUp: ['1 week for progress assessment'],
        patientEducation: ['Proper posture', 'Neck exercises', 'Ergonomic workstation setup'],
        preventiveCare: ['Stress management', 'Regular exercise', 'Sleep hygiene']
      }
    },
    chiropracticTemplate: {
      subjective: {
        mainComplaints: ['Neck'],
        otherComplaint: '',
        problemStart: '2 weeks ago',
        problemBegin: 'Gradual',
        painRating: [6],
        painBetter: 'Heat, gentle movement, rest',
        painWorse: 'Computer work, stress, poor posture',
        painDescriptions: ['Achy', 'Dull'],
        painRadiate: 'No radiation',
        painFrequency: ['Constant'],
        otherSymptoms: 'Neck stiffness, shoulder tension',
        medications: 'Ibuprofen as needed',
        reviewOfSystems: {
          neurological: { 'Headaches': 'yes', 'Dizziness': 'no', 'Numbness': 'no', 'Weakness': 'no', 'Tremors': 'no', 'Memory issues': 'no' },
          cardiovascular: { 'Chest pain': 'no', 'Palpitations': 'no', 'Swelling': 'no', 'Shortness of breath': 'no', 'High blood pressure': 'no' },
          respiratory: { 'Cough': 'no', 'Wheezing': 'no', 'Breathing difficulties': 'no', 'Asthma': 'no' },
          musculoskeletal: { 'Joint pain': 'yes', 'Stiffness': 'yes', 'Swelling': 'no', 'Muscle weakness': 'no', 'Previous injuries': 'no' },
          gastrointestinal: { 'Poor appetite': 'no', 'Nausea': 'no', 'Bowel changes': 'no', 'Abdominal pain': 'no' },
          genitourinary: { 'Frequent urination': 'no', 'Urgency': 'no', 'Pain with urination': 'no', 'Reproductive issues': 'no' },
          endocrine: { 'Fatigue': 'no', 'Weight changes': 'no', 'Temperature sensitivity': 'no', 'Excessive thirst': 'no' },
          skinImmune: { 'Rashes': 'no', 'Allergies': 'no', 'Frequent infections': 'no', 'Poor healing': 'no' },
          mentalHealth: { 'Mood changes': 'no', 'Sleep problems': 'no', 'Anxiety': 'no', 'High stress levels': 'yes' },
          notes: {
            neurological: 'Mild tension headaches',
            cardiovascular: '',
            respiratory: '',
            musculoskeletal: 'Neck stiffness and shoulder tension',
            gastrointestinal: '',
            genitourinary: '',
            endocrine: '',
            skinImmune: '',
            mentalHealth: 'Work-related stress'
          }
        }
      },
      objective: {
        posture: ['Forward Head'],
        gait: ['Normal'],
        gaitOther: '',
        muscleTone: 'Increased tension in upper trapezius',
        tenderness: 'Suboccipital region, upper trapezius',
        triggerPoints: 'Active trigger points in upper trapezius',
        jointFixation: 'C1-C2 and C5-C6 segments',
        edema: 'None',
        edemaLocation: '',
        reflexes: 'Normal and symmetrical',
        sensation: 'Intact',
        sensationLocation: '',
        strength: '5/5 cervical movements',
        strengthMuscle: 'Cervical flexors, extensors',
        vitalSigns: {
          bp: '120/80',
          hr: '72',
          resp: '16',
          temp: '98.6',
          height: '',
          weight: '',
          oxygenSaturation: '99'
        },
        rangeOfMotion: {
          cervical: {
            flexion: '35°',
            extension: '45°',
            rotation: '60°',
            lateralFlexion: '30°'
          },
          thoracic: {
            rotation: '',
            flexionExtension: ''
          },
          lumbar: {
            flexion: '',
            extension: '',
            lateralFlexion: '',
            rotation: ''
          }
        },
        orthopedicTests: {
          slr: '',
          slrAngle: '',
          kemps: '',
          kempsSide: '',
          faber: '',
          faberSide: '',
          yeoman: '',
          otherTests: 'Spurling\'s test: negative, Distraction test: positive'
        }
      }
    },
    redFlags: ['Severe neurological deficits', 'Signs of myelopathy', 'Vertebral artery insufficiency', 'Fracture'],
    clinicalPearls: ['Screen for red flags before manipulation', 'Address postural factors', 'Consider cervical pillow']
  },

  {
    id: 'chiropractic-shoulder-pain',
    name: 'Shoulder Impingement',
    category: 'Chiropractic',
    specialty: 'Chiropractic',
    description: 'Chiropractic evaluation and treatment for shoulder impingement syndrome',
    icon: '💪',
    keywords: ['shoulder pain', 'impingement', 'rotator cuff', 'subacromial', 'bursitis'],
    icd10Codes: ['M75.30', 'M75.40', 'M25.511'],
    cptCodes: ['98940', '97110', '99213'],
    ageGroups: ['adult', 'geriatric'],
    urgencyLevel: 'medium',
    template: {
      subjective: {
        chiefComplaint: 'Patient presents with shoulder pain and limited range of motion',
        historyOfPresentIllness: 'Pain with overhead activities, night pain, mechanism of injury',
        reviewOfSystems: ['Weakness', 'Numbness', 'Catching sensation', 'Night pain'],
        pastMedicalHistory: ['Previous shoulder injuries', 'Rotator cuff tears', 'Arthritis'],
        medications: ['NSAIDs', 'Topical analgesics'],
        allergies: ['Drug allergies'],
        socialHistory: ['Occupation', 'Sports activities', 'Overhead activities'],
        familyHistory: ['Shoulder problems', 'Arthritis']
      },
      objective: {
        vitalSigns: ['BP', 'HR', 'Pain scale'],
        physicalExam: ['Shoulder ROM', 'Strength testing', 'Impingement tests', 'Instability tests'],
        diagnosticTests: ['X-ray shoulder', 'MRI if indicated']
      },
      assessment: {
        primaryDiagnosis: 'Shoulder impingement syndrome',
        differentialDiagnoses: ['Rotator cuff tendinopathy', 'Subacromial bursitis', 'Adhesive capsulitis', 'AC joint arthritis'],
        clinicalImpression: 'Shoulder impingement with functional limitation'
      },
      plan: {
        treatments: ['Joint mobilization', 'Soft tissue therapy', 'Strengthening exercises', 'Activity modification'],
        medications: ['NSAIDs', 'Ice therapy'],
        diagnostics: ['Follow-up in 2 weeks', 'MRI if no improvement'],
        followUp: ['2 weeks for progress check'],
        patientEducation: ['Proper lifting technique', 'Shoulder exercises', 'Activity modification'],
        preventiveCare: ['Postural exercises', 'Ergonomic assessment']
      }
    },
    chiropracticTemplate: {
      subjective: {
        mainComplaints: ['Shoulder'],
        painAssessment: {
          rating: 7,
          descriptions: ['Sharp', 'Achy'],
          frequency: 'Intermittent',
          radiation: 'No radiation',
          triggers: ['Overhead reaching', 'Lifting']
        },
        problemHistory: {
          onset: 'Gradual',
          mechanism: 'Repetitive overhead activity',
          aggravatingFactors: ['Overhead activities', 'Sleeping on affected side'],
          alleviatingFactors: ['Rest', 'Ice', 'Anti-inflammatories']
        },
        reviewOfSystems: {
          musculoskeletal: ['Shoulder stiffness', 'Weakness with overhead activities']
        }
      },
      objective: {
        posture: ['Rounded Shoulders'],
        gait: ['Normal'],
        rangeOfMotion: {},
        orthopedicTests: [
          { name: 'Hawkins-Kennedy Test', result: 'Positive', notes: 'Pain with impingement' },
          { name: 'Neer\'s Test', result: 'Positive', notes: 'Reproduces shoulder pain' },
          { name: 'Empty Can Test', result: 'Weak', notes: 'Supraspinatus weakness' }
        ],
        neurologicalFindings: {
          reflexes: { 'Biceps': 'Normal', 'Triceps': 'Normal' },
          sensation: { 'Deltoid': 'Intact', 'Lateral arm': 'Intact' },
          strength: { 'Supraspinatus': 'Weak', 'Infraspinatus': 'Normal', 'Deltoid': 'Normal' }
        },
        clinicalFindings: ['Subacromial tenderness', 'Restricted shoulder abduction']
      }
    },
    redFlags: ['Complete loss of function', 'Signs of massive rotator cuff tear', 'Neurovascular compromise'],
    clinicalPearls: ['Night pain suggests rotator cuff pathology', 'Avoid overhead activities initially', 'Progress exercises gradually']
  }
];

export function getTemplatesByCategory(category: string): MedicalTemplate[] {
  return medicalTemplates.filter(template => template.category === category);
}

export function getTemplatesBySpecialty(specialty: string): MedicalTemplate[] {
  return medicalTemplates.filter(template => template.specialty === specialty);
}

export function searchTemplates(query: string): MedicalTemplate[] {
  const lowerQuery = query.toLowerCase();
  return medicalTemplates.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateById(id: string): MedicalTemplate | undefined {
  return medicalTemplates.find(template => template.id === id);
}