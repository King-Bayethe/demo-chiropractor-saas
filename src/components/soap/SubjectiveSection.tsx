import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PatientMedicalSummary } from "./PatientMedicalSummary";
import { autofillSOAPFromPatient, convertCurrentSymptomsToSOAP, convertFamilyHistoryToSOAP } from "@/utils/soapFormMapping";

interface SubjectiveSectionProps {
  data: SubjectiveData;
  onChange: (data: SubjectiveData) => void;
  specialty?: 'chiropractic' | 'general';
  patient?: any;
}

export interface SubjectiveData {
  // Standard fields
  symptoms: string[];
  painScale: number | null;
  painDescription: string;
  otherSymptoms: string;
  isRefused: boolean;
  isWithinNormalLimits: boolean;
  
  // Enhanced questionnaire fields
  painWorse?: string;
  painBetter?: string;
  currentSymptoms?: {
    // Head & Neck
    headache?: boolean;
    neck_pain?: boolean;
    jaw_pain?: boolean;
    facial_pain?: boolean;
    neck_stiffness?: boolean;
    
    // Arms & Hands
    arm_pain?: boolean;
    shoulder_pain?: boolean;
    elbow_pain?: boolean;
    wrist_pain?: boolean;
    hand_pain?: boolean;
    finger_numbness?: boolean;
    arm_weakness?: boolean;
    tingling_arms_hands?: boolean;
    
    // Back & Core
    upper_back_pain?: boolean;
    mid_back_pain?: boolean;
    lower_back_pain?: boolean;
    back_stiffness?: boolean;
    muscle_spasms?: boolean;
    chest_pain?: boolean;
    
    // Legs & Feet
    hip_pain?: boolean;
    thigh_pain?: boolean;
    knee_pain?: boolean;
    leg_pain?: boolean;
    ankle_pain?: boolean;
    foot_pain?: boolean;
    leg_weakness?: boolean;
    leg_numbness?: boolean;
    tingling_legs_feet?: boolean;
    
    // Neurological
    dizziness?: boolean;
    vision_problems?: boolean;
    hearing_problems?: boolean;
    memory_problems?: boolean;
    concentration_issues?: boolean;
    balance_problems?: boolean;
    
    // General
    fatigue?: boolean;
    sleep_problems?: boolean;
    anxiety?: boolean;
    depression?: boolean;
    nausea?: boolean;
    appetite_changes?: boolean;
    irritability?: boolean;
  };
  familyHistory?: {
    heart_trouble?: boolean;
    stroke?: boolean;
    diabetes?: boolean;
    cancer?: boolean;
    arthritis?: boolean;
    high_blood_pressure?: boolean;
    kidney_disease?: boolean;
    mental_illness?: boolean;
    asthma?: boolean;
    epilepsy?: boolean;
    kyphosis?: boolean;
    lung_disease?: boolean;
    osteoporosis?: boolean;
    migraines?: boolean;
    scoliosis?: boolean;
    spine_problems?: boolean;
    other_conditions?: string;
  };
  medicalHistory?: {
    previousOfficeVisit?: boolean;
    previousAccidents?: string;
    illness?: string;
    surgery?: string;
    trauma?: string;
    medications?: string;
    allergies?: string;
  };
  functionalLimitations?: string;
  
  // Enhanced chiropractic fields (optional for backward compatibility)
  mainComplaints?: string[];
  otherComplaint?: string;
  problemStart?: string;
  problemBegin?: string;
  painRating?: number[];
  painDescriptions?: string[];
  painRadiate?: string;
  painFrequency?: string[];
  medications?: string;
  reviewOfSystems?: {
    neurological?: any;
    cardiovascular?: any;
    respiratory?: any;
    musculoskeletal?: any;
    gastrointestinal?: any;
    genitourinary?: any;
    endocrine?: any;
    skinImmune?: any;
    mentalHealth?: any;
    notes?: {
      neurological?: string;
      cardiovascular?: string;
      respiratory?: string;
      musculoskeletal?: string;
      gastrointestinal?: string;
      genitourinary?: string;
      endocrine?: string;
      skinImmune?: string;
      mentalHealth?: string;
    };
  };
}


const painFaces = [
  { value: 0, emoji: '😊', label: 'No Pain' },
  { value: 2, emoji: '😐', label: 'Mild' },
  { value: 4, emoji: '😟', label: 'Moderate' },
  { value: 6, emoji: '😣', label: 'Severe' },
  { value: 8, emoji: '😫', label: 'Very Severe' },
  { value: 10, emoji: '😱', label: 'Worst Pain' }
];

export function SubjectiveSection({ data, onChange, patient }: SubjectiveSectionProps) {
  // Helper function to intelligently map patient data to SOAP fields
  const mapPatientDataToSOAP = () => {
    if (!patient) return;
    
    console.log('Mapping patient data to SOAP:', patient);
    
    const updatedData = { ...data };
    let hasUpdates = false;
    
    // Initialize nested objects if they don't exist
    if (!updatedData.medicalHistory) {
      updatedData.medicalHistory = {};
    }
    if (!updatedData.currentSymptoms) {
      updatedData.currentSymptoms = {};
    }
    if (!updatedData.familyHistory) {
      updatedData.familyHistory = {};
    }
    
    
    // Smart mapping for medications - check multiple potential fields
    if (!updatedData.medicalHistory.medications) {
      const medicationSources = [
        patient.current_medications,
        patient.medications,
        patient.other_medical_history
      ].filter(Boolean);
      
      if (medicationSources.length > 0) {
        updatedData.medicalHistory.medications = medicationSources.join(', ');
        hasUpdates = true;
      }
    }
    
    // Smart mapping for allergies
    if (!updatedData.medicalHistory.allergies && patient.allergies) {
      updatedData.medicalHistory.allergies = patient.allergies;
      hasUpdates = true;
    }
    
    // Smart mapping for previous accidents/trauma
    if (!updatedData.medicalHistory.previousAccidents) {
      const accidentSources = [
        patient.previous_accidents,
        patient.accident_description,
        patient.past_injuries
      ].filter(Boolean);
      
      if (accidentSources.length > 0) {
        updatedData.medicalHistory.previousAccidents = accidentSources.join('; ');
        hasUpdates = true;
      }
    }
    
    // Smart mapping for trauma/injuries
    if (!updatedData.medicalHistory.trauma) {
      const traumaSources = [
        patient.past_injuries,
        patient.accident_description,
        patient.previous_accidents
      ].filter(Boolean);
      
      if (traumaSources.length > 0) {
        updatedData.medicalHistory.trauma = traumaSources.join('; ');
        hasUpdates = true;
      }
    }
    
    // Smart mapping for chronic conditions/illness
    if (!updatedData.medicalHistory.illness) {
      const illnessSources = [
        patient.chronic_conditions,
        patient.other_medical_history,
        patient.medical_systems_review && typeof patient.medical_systems_review === 'object' 
          ? Object.entries(patient.medical_systems_review)
              .filter(([_, value]) => value === true || value === 'yes')
              .map(([key, _]) => key)
              .join(', ')
          : null
      ].filter(Boolean);
      
      if (illnessSources.length > 0) {
        updatedData.medicalHistory.illness = illnessSources.join('; ');
        hasUpdates = true;
      }
    }
    
    // Smart mapping for pain description
    if (!updatedData.painDescription) {
      let painDesc = '';
      
      if (patient.pain_description) {
        if (typeof patient.pain_description === 'object') {
          painDesc = patient.pain_description.description || JSON.stringify(patient.pain_description);
        } else {
          painDesc = patient.pain_description;
        }
      } else if (patient.current_symptoms) {
        if (typeof patient.current_symptoms === 'object') {
          painDesc = JSON.stringify(patient.current_symptoms);
        } else {
          painDesc = patient.current_symptoms;
        }
      } else if (patient.symptom_changes) {
        painDesc = patient.symptom_changes;
      } else if (patient.pain_location) {
        painDesc = `Pain in ${patient.pain_location}`;
      }
      
      if (painDesc) {
        updatedData.painDescription = painDesc;
        hasUpdates = true;
      }
    }
    
    // Smart mapping for pain scale
    if (!updatedData.painScale && patient.pain_severity) {
      updatedData.painScale = patient.pain_severity;
      hasUpdates = true;
    }
    
    // Smart mapping for current symptoms with comprehensive field mappings
    if (patient.current_symptoms) {
      console.log('Found current_symptoms in patient data:', patient.current_symptoms);
      try {
        const symptoms = typeof patient.current_symptoms === 'string' 
          ? JSON.parse(patient.current_symptoms) 
          : patient.current_symptoms;
        
        console.log('Parsed symptoms:', symptoms);
        
        if (typeof symptoms === 'object' && symptoms !== null) {
          const unmappedSymptoms = [];
          
          // Define comprehensive field mappings for ALL patient profile fields
          const symptomMappings = {
            // Memory & Cognitive
            'loss_memory': 'memory_problems',
            'memory_loss': 'memory_problems',
            'concentration_problems': 'concentration_issues',
            'confusion': 'memory_problems',
            
            // Balance & Coordination
            'loss_balance': 'balance_problems',
            'balance_issues': 'balance_problems',
            'coordination_problems': 'balance_problems',
            'unsteady': 'balance_problems',
            
            // Sleep & Fatigue
            'sleeping_problems': 'sleep_problems',
            'sleep_difficulties': 'sleep_problems',
            'insomnia': 'sleep_problems',
            'tired': 'fatigue',
            'exhausted': 'fatigue',
            'weakness': 'fatigue',
            
            // Arms & Hands (multiple field mappings)
            'numbness_arms_hands': 'finger_numbness',
            'numbnessArmsHands': 'finger_numbness',
            'pain_arms_hands': ['arm_pain', 'hand_pain', 'shoulder_pain'],
            'painArmsHands': ['arm_pain', 'hand_pain', 'shoulder_pain'],
            'loss_strength_arms': 'arm_weakness',
            'lossStrengthArms': 'arm_weakness',
            'tingling_arms_hands': 'tingling_arms_hands',
            'tinglingArmsHands': 'tingling_arms_hands',
            'arm_tingling': 'tingling_arms_hands',
            'hand_tingling': 'tingling_arms_hands',
            'arm_numbness': 'finger_numbness',
            'hand_numbness': 'finger_numbness',
            'shoulder_problems': 'shoulder_pain',
            'elbow_problems': 'elbow_pain',
            'wrist_problems': 'wrist_pain',
            
            // Legs & Feet (multiple field mappings) 
            'loss_strength_legs': 'leg_weakness',
            'lossStrengthLegs': 'leg_weakness',
            'pain_legs_feet': ['leg_pain', 'foot_pain', 'knee_pain'],
            'painLegsFeet': ['leg_pain', 'foot_pain', 'knee_pain'],
            'numbness_legs_feet': 'leg_numbness',
            'numbnessLegsFeet': 'leg_numbness',
            'tingling_legs_feet': 'tingling_legs_feet',
            'tinglingLegsFeet': 'tingling_legs_feet',
            'leg_tingling': 'tingling_legs_feet',
            'foot_tingling': 'tingling_legs_feet',
            'hip_problems': 'hip_pain',
            'knee_problems': 'knee_pain',
            'ankle_problems': 'ankle_pain',
            'thigh_problems': 'thigh_pain',
            
            // Back & Spine
            'chest_pain_rib': ['chest_pain'],
            'back_problems': ['lower_back_pain', 'upper_back_pain'],
            'spine_problems': ['back_stiffness'],
            'muscle_tension': ['muscle_spasms'],
            'stiffness': ['back_stiffness', 'neck_stiffness'],
            
            // Head & Neck
            'head_pain': ['headache'],
            'migraines': ['headache'],
            'face_pain': ['facial_pain'],
            'jaw_problems': ['jaw_pain'],
            'neck_problems': ['neck_pain', 'neck_stiffness'],
            
            // Neurological
            'dizzy': 'dizziness',
            'lightheaded': 'dizziness',
            'vision_changes': 'vision_problems',
            'hearing_changes': 'hearing_problems',
            'ear_problems': 'hearing_problems',
            'ringing_ears': 'hearing_problems',
            
            // Sensory Issues
            'shortness_breath': 'chest_pain',
            'breathing_problems': 'chest_pain',
            
            // Emotional & Mental
            'irritability': 'anxiety',
            'mood_changes': 'depression',
            'stress': 'anxiety',
            'emotional_problems': 'depression',
            
            // Digestive & General
            'stomach_problems': 'nausea',
            'digestive_issues': 'nausea',
            'appetite_loss': 'appetite_changes',
            'weight_changes': 'appetite_changes'
          };
          
          // Map symptoms from patient profile to SOAP form fields
          Object.entries(symptoms).forEach(([key, value]) => {
            if (value === true || value === 'true') {
              let mapped = false;
              
              // Check direct field name match
              if (updatedData.currentSymptoms.hasOwnProperty(key)) {
                updatedData.currentSymptoms[key] = true;
                hasUpdates = true;
                mapped = true;
                console.log(`Direct mapped symptom: ${key} = true`);
              }
              // Check custom mappings
              else if (symptomMappings[key]) {
                const targets = Array.isArray(symptomMappings[key]) ? symptomMappings[key] : [symptomMappings[key]];
                targets.forEach(target => {
                  if (updatedData.currentSymptoms.hasOwnProperty(target)) {
                    updatedData.currentSymptoms[target] = true;
                    hasUpdates = true;
                    mapped = true;
                    console.log(`Custom mapped symptom: ${key} -> ${target} = true`);
                  }
                });
              }
              
              // If no mapping found, add to unmapped list for "Other" section
              if (!mapped) {
                const readableLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                unmappedSymptoms.push(readableLabel);
                console.log(`Unmapped symptom added to Other: ${key} -> ${readableLabel}`);
              }
            }
          });
          
          // Add unmapped symptoms to otherSymptoms field
          if (unmappedSymptoms.length > 0) {
            const existingOther = updatedData.otherSymptoms || '';
            const newOtherSymptoms = unmappedSymptoms.join(', ');
            updatedData.otherSymptoms = existingOther 
              ? `${existingOther}, ${newOtherSymptoms}` 
              : newOtherSymptoms;
            hasUpdates = true;
            console.log(`Added unmapped symptoms to Other section: ${newOtherSymptoms}`);
          }
        }
      } catch (error) {
        console.error('Error parsing current symptoms:', error);
      }
    }
    
    // Smart mapping for family medical history with comprehensive field mappings
    if (patient.family_medical_history || patient.family_history) {
      console.log('Found family history in patient data:', patient.family_medical_history || patient.family_history);
      const familyHistoryData = patient.family_medical_history || patient.family_history;
      
      try {
        if (typeof familyHistoryData === 'string') {
          // Parse text and look for keywords
          const text = familyHistoryData.toLowerCase();
          const conditions = ['heart', 'stroke', 'diabetes', 'cancer', 'arthritis', 'hypertension'];
          
          conditions.forEach(condition => {
            if (text.includes(condition)) {
              const fieldName = condition === 'hypertension' ? 'high_blood_pressure' : condition;
              if (updatedData.familyHistory.hasOwnProperty(fieldName)) {
                updatedData.familyHistory[fieldName] = true;
                hasUpdates = true;
                console.log(`Mapped family history: ${fieldName} = true`);
              }
            }
          });
          
          // Add the entire text to other_conditions if it contains unmapped info
          if (!updatedData.familyHistory.other_conditions) {
            updatedData.familyHistory.other_conditions = familyHistoryData;
            hasUpdates = true;
            console.log('Added family history text to other_conditions');
          }
        } else if (typeof familyHistoryData === 'object' && familyHistoryData !== null) {
          const unmappedFamilyConditions = [];
          
          // Define comprehensive family history field mappings for ALL patient profile fields
          const familyMappings = {
            // Heart & Cardiovascular
            'heart_trouble': 'heart_trouble',
            'heart_disease': 'heart_trouble',
            'cardiac_issues': 'heart_trouble',
            'coronary_disease': 'heart_trouble',
            'cardiovascular_disease': 'heart_trouble',
            
            // Blood Pressure & Circulation
            'hypertension': 'high_blood_pressure',
            'high_bp': 'high_blood_pressure',
            'blood_pressure': 'high_blood_pressure',
            'circulation_problems': 'high_blood_pressure',
            
            // Neurological & Brain
            'stroke': 'stroke',
            'brain_attack': 'stroke',
            'cerebrovascular_accident': 'stroke',
            'aneurysm': 'stroke',
            'seizures': 'epilepsy',
            'convulsions': 'epilepsy',
            
            // Metabolic & Endocrine
            'diabetes': 'diabetes',
            'diabetic': 'diabetes',
            'blood_sugar': 'diabetes',
            'insulin_resistance': 'diabetes',
            
            // Cancer & Tumors
            'cancer': 'cancer',
            'malignancy': 'cancer',
            'tumor': 'cancer',
            'oncology': 'cancer',
            
            // Joint & Bone
            'arthritis': 'arthritis',
            'joint_disease': 'arthritis',
            'rheumatoid': 'arthritis',
            'osteoarthritis': 'arthritis',
            'kyphosis': 'arthritis',
            'scoliosis': 'arthritis',
            'spine_problems': 'arthritis',
            'osteoporosis': 'arthritis',
            
            // Respiratory
            'asthma': 'asthma',
            'breathing_problems': 'asthma',
            'lung_disease': 'asthma',
            'respiratory_disease': 'asthma',
            'copd': 'asthma',
            
            // Mental Health
            'mental_illness': 'mental_illness',
            'psychiatric': 'mental_illness',
            'depression': 'mental_illness',
            'anxiety': 'mental_illness',
            'bipolar': 'mental_illness',
            'schizophrenia': 'mental_illness',
            'alcohol_dependence': 'mental_illness',
            'substance_abuse': 'mental_illness',
            
            // Kidney & Renal
            'kidney_disease': 'kidney_disease',
            'renal_disease': 'kidney_disease',
            'kidney_failure': 'kidney_disease',
            'nephritis': 'kidney_disease',
            
            // Neurological Disorders
            'epilepsy': 'epilepsy',
            'migraines': 'mental_illness', // Map to mental_illness as closest match
            'headaches': 'mental_illness'
          };
          
          // Use the enhanced mapping function from soapFormMapping
          const convertedFamilyHistory = convertFamilyHistoryToSOAP(familyHistoryData);
          
          // Apply mapped family history
          Object.entries(convertedFamilyHistory.familyHistory).forEach(([field, value]) => {
            if (value === true && updatedData.familyHistory.hasOwnProperty(field)) {
              updatedData.familyHistory[field] = true;
              hasUpdates = true;
              console.log(`Mapped family history: ${field} = true`);
            }
          });
          
          // Add any unmapped conditions to other_conditions
          if (convertedFamilyHistory.otherFamilyHistory) {
            const existingOther = updatedData.familyHistory.other_conditions || '';
            updatedData.familyHistory.other_conditions = existingOther 
              ? `${existingOther}; ${convertedFamilyHistory.otherFamilyHistory}` 
              : convertedFamilyHistory.otherFamilyHistory;
            hasUpdates = true;
            console.log(`Added unmapped family history to other_conditions: ${convertedFamilyHistory.otherFamilyHistory}`);
          }
        }
      } catch (error) {
        console.error('Error parsing family history:', error);
      }
    }
    
    if (hasUpdates) {
      onChange(updatedData);
    }
  };

  // Enhanced autofill from patient data using mapping system
  useEffect(() => {
    console.log('SubjectiveSection useEffect triggered with patient:', patient);
    console.log('Current data state:', data);
    
    if (patient) {
      console.log('Starting enhanced patient autofill with data:', patient);
      const autofillData = autofillSOAPFromPatient(patient);
      console.log('Generated autofill data:', autofillData);
      
      // Check if we have any meaningful autofill data
      const hasAutofillData = (
        Object.keys(autofillData.currentSymptoms || {}).length > 0 || 
        Object.keys(autofillData.familyHistory || {}).length > 0 ||
        autofillData.painScale ||
        autofillData.painDescription ||
        autofillData.otherSymptoms ||
        autofillData.otherFamilyHistory
      );
      
      // Only autofill if there's meaningful data and current form is mostly empty
      const formNeedsAutofill = (
        !data.currentSymptoms || Object.values(data.currentSymptoms || {}).every(val => !val) ||
        !data.familyHistory || Object.values(data.familyHistory || {}).every(val => !val) ||
        !data.painScale || !data.painDescription
      );
      
      if (hasAutofillData && formNeedsAutofill) {
        console.log('Applying enhanced autofill...');
        const updatedData = {
          ...data,
          currentSymptoms: {
            ...data.currentSymptoms,
            ...autofillData.currentSymptoms
          },
          familyHistory: {
            ...data.familyHistory,
            ...autofillData.familyHistory
          },
          painScale: autofillData.painScale || data.painScale,
          painDescription: autofillData.painDescription || data.painDescription,
          otherSymptoms: [
            data.otherSymptoms, 
            autofillData.otherSymptoms, 
            autofillData.otherFamilyHistory
          ].filter(Boolean).join(', ') || data.otherSymptoms,
          functionalLimitations: autofillData.functionalLimitations || data.functionalLimitations
        };
        
        console.log('Final enhanced autofill data being applied:', updatedData);
        onChange(updatedData);
      } else {
        // Fallback to original mapping for backwards compatibility
        console.log('Using fallback mapping system');
        mapPatientDataToSOAP();
      }
    } else {
      console.log('Autofill conditions not met');
    }
  }, [patient]);


  const handleMedicalHistoryChange = (field: string, value: any) => {
    onChange({
      ...data,
      medicalHistory: {
        ...data.medicalHistory,
        [field]: value
      }
    });
  };

  const handleCurrentSymptomsChange = (symptom: string, checked: boolean) => {
    onChange({
      ...data,
      currentSymptoms: {
        ...data.currentSymptoms,
        [symptom]: checked
      }
    });
  };

  const handleFamilyHistoryChange = (condition: string, value: boolean | string) => {
    onChange({
      ...data,
      familyHistory: {
        ...data.familyHistory,
        [condition]: value
      }
    });
  };

  const handlePainScaleChange = (value: number) => {
    onChange({ ...data, painScale: value });
  };

  const isDisabled = data.isRefused || data.isWithinNormalLimits;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-primary">S - Subjective</CardTitle>
            <p className="text-sm text-muted-foreground">Patient's reported symptoms and history</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="wnl"
                checked={data.isWithinNormalLimits}
                onCheckedChange={(checked) => onChange({ 
                  ...data, 
                  isWithinNormalLimits: checked,
                  isRefused: checked ? false : data.isRefused 
                })}
              />
              <Label htmlFor="wnl" className="text-sm">WNL</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="refused"
                checked={data.isRefused}
                onCheckedChange={(checked) => onChange({ 
                  ...data, 
                  isRefused: checked,
                  isWithinNormalLimits: checked ? false : data.isWithinNormalLimits 
                })}
              />
              <Label htmlFor="refused" className="text-sm">Refused</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.isWithinNormalLimits && (
          <div className="text-center py-4">
            <Badge variant="secondary" className="bg-success/10 text-success">
              Patient reports symptoms within normal limits
            </Badge>
          </div>
        )}
        
        {data.isRefused && (
          <div className="text-center py-4">
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
              Patient refused to provide subjective information
            </Badge>
          </div>
        )}

        {!isDisabled && (
          <>
            {/* Pain Description - First question */}
            <div>
              <Label htmlFor="painDescription" className="text-base font-semibold">Pain Description</Label>
              <p className="text-sm text-muted-foreground mb-2">Describe the character, location, duration, and triggers</p>
              <Textarea
                id="painDescription"
                value={data.painDescription}
                onChange={(e) => onChange({ ...data, painDescription: e.target.value })}
                placeholder="e.g., Sharp, stabbing pain in lower back, worse in morning, radiates to left leg..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Pain Aggravating/Alleviating Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="painWorse" className="text-base font-semibold">What makes it worse?</Label>
                <Textarea
                  id="painWorse"
                  value={data.painWorse || ''}
                  onChange={(e) => onChange({ ...data, painWorse: e.target.value })}
                  placeholder="Describe what makes the pain worse..."
                  rows={2}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="painBetter" className="text-base font-semibold">What makes it better?</Label>
                <Textarea
                  id="painBetter"
                  value={data.painBetter || ''}
                  onChange={(e) => onChange({ ...data, painBetter: e.target.value })}
                  placeholder="Describe what makes the pain better..."
                  rows={2}
                  className="mt-2"
                />
              </div>
            </div>

            <Separator />

            {/* Current Symptoms */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-primary">Current Symptoms</h4>
              
              {/* Head & Neck */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Head & Neck</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'headache', label: 'Headache' },
                    { key: 'neck_pain', label: 'Neck Pain' },
                    { key: 'jaw_pain', label: 'Jaw Pain' },
                    { key: 'facial_pain', label: 'Facial Pain' },
                    { key: 'neck_stiffness', label: 'Neck Stiffness' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${key}`}
                        checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                        onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                      />
                      <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arms & Hands */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Arms & Hands</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {[
                     { key: 'arm_pain', label: 'Arm Pain' },
                     { key: 'shoulder_pain', label: 'Shoulder Pain' },
                     { key: 'elbow_pain', label: 'Elbow Pain' },
                     { key: 'wrist_pain', label: 'Wrist Pain' },
                     { key: 'hand_pain', label: 'Hand Pain' },
                     { key: 'finger_numbness', label: 'Finger Numbness' },
                     { key: 'arm_weakness', label: 'Arm Weakness' },
                     { key: 'tingling_arms_hands', label: 'Tingling Arms/Hands' }
                   ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${key}`}
                        checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                        onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                      />
                      <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back & Core */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Back & Core</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'upper_back_pain', label: 'Upper Back Pain' },
                    { key: 'mid_back_pain', label: 'Mid Back Pain' },
                    { key: 'lower_back_pain', label: 'Lower Back Pain' },
                    { key: 'back_stiffness', label: 'Back Stiffness' },
                    { key: 'muscle_spasms', label: 'Muscle Spasms' },
                    { key: 'chest_pain', label: 'Chest Pain' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${key}`}
                        checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                        onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                      />
                      <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legs & Feet */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Legs & Feet</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {[
                     { key: 'hip_pain', label: 'Hip Pain' },
                     { key: 'thigh_pain', label: 'Thigh Pain' },
                     { key: 'knee_pain', label: 'Knee Pain' },
                     { key: 'leg_pain', label: 'Leg Pain' },
                     { key: 'ankle_pain', label: 'Ankle Pain' },
                     { key: 'foot_pain', label: 'Foot Pain' },
                     { key: 'leg_weakness', label: 'Leg Weakness' },
                     { key: 'leg_numbness', label: 'Leg Numbness' },
                     { key: 'tingling_legs_feet', label: 'Tingling Legs/Feet' }
                   ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${key}`}
                        checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                        onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                      />
                      <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neurological */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Neurological</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'dizziness', label: 'Dizziness' },
                    { key: 'vision_problems', label: 'Vision Problems' },
                    { key: 'hearing_problems', label: 'Hearing Problems' },
                    { key: 'memory_problems', label: 'Memory Problems' },
                    { key: 'concentration_issues', label: 'Concentration Issues' },
                    { key: 'balance_problems', label: 'Balance Problems' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${key}`}
                        checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                        onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                      />
                      <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

            {/* General */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-muted-foreground">General</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {[
                   { key: 'fatigue', label: 'Fatigue' },
                   { key: 'sleep_problems', label: 'Sleep Problems' },
                   { key: 'anxiety', label: 'Anxiety' },
                   { key: 'depression', label: 'Depression' },
                   { key: 'nausea', label: 'Nausea' },
                   { key: 'appetite_changes', label: 'Appetite Changes' },
                   { key: 'irritability', label: 'Irritability' }
                 ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${key}`}
                      checked={data.currentSymptoms?.[key as keyof typeof data.currentSymptoms] || false}
                      onCheckedChange={(checked) => handleCurrentSymptomsChange(key, checked as boolean)}
                    />
                    <Label htmlFor={`current-${key}`} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="other-symptoms" className="text-sm font-medium text-muted-foreground">
                Other Symptoms
              </Label>
              <Textarea
                id="other-symptoms"
                placeholder="Please specify any other symptoms not listed above..."
                value={data.otherSymptoms || ''}
                onChange={(e) => onChange({ ...data, otherSymptoms: e.target.value })}
                className="min-h-[60px]"
              />
            </div>
          </div>

            <Separator />

            {/* Pain Scale */}
            <div>
              <Label className="text-base font-semibold">Pain Assessment</Label>
              <p className="text-sm text-muted-foreground mb-4">Rate current pain level</p>
              
              {/* Numerical Scale */}
              <div className="mb-4">
                <Label className="text-sm mb-2 block">Numerical Scale (0-10)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={data.painScale || ''}
                    onChange={(e) => handlePainScaleChange(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
              </div>

              {/* Faces Scale */}
              <div>
                <Label className="text-sm mb-2 block">Faces Pain Scale</Label>
                <div className="grid grid-cols-6 gap-2">
                  {painFaces.map((face) => (
                    <Button
                      key={face.value}
                      type="button"
                      variant={data.painScale === face.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePainScaleChange(face.value)}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <span className="text-lg mb-1">{face.emoji}</span>
                      <span className="text-xs">{face.value}</span>
                      <span className="text-xs">{face.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical History */}
            <div>
              <Label className="text-base font-semibold">Medical History</Label>
              <div className="space-y-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">Have you ever been in our office before?</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="previous-yes"
                        checked={data.medicalHistory?.previousOfficeVisit === true}
                        onCheckedChange={(checked) => handleMedicalHistoryChange('previousOfficeVisit', checked)}
                      />
                      <Label htmlFor="previous-yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="previous-no"
                        checked={data.medicalHistory?.previousOfficeVisit === false}
                        onCheckedChange={(checked) => handleMedicalHistoryChange('previousOfficeVisit', !checked)}
                      />
                      <Label htmlFor="previous-no" className="text-sm">No</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="previousAccidents" className="text-sm font-medium">List any previous accidents (automobile, on the job injuries, slips, falls, sports, etc.) and date:</Label>
                  <Textarea
                    id="previousAccidents"
                    value={data.medicalHistory?.previousAccidents || ''}
                    onChange={(e) => handleMedicalHistoryChange('previousAccidents', e.target.value)}
                    placeholder="Previous accidents..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="illness" className="text-sm font-medium">Illness:</Label>
                  <Input
                    id="illness"
                    value={data.medicalHistory?.illness || ''}
                    onChange={(e) => handleMedicalHistoryChange('illness', e.target.value)}
                    placeholder="Any illnesses..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="surgery" className="text-sm font-medium">Surgery/hospitalization:</Label>
                  <Input
                    id="surgery"
                    value={data.medicalHistory?.surgery || ''}
                    onChange={(e) => handleMedicalHistoryChange('surgery', e.target.value)}
                    placeholder="Surgery/hospitalization details..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="trauma" className="text-sm font-medium">Trauma/Injuries/Accidents:</Label>
                  <Input
                    id="trauma"
                    value={data.medicalHistory?.trauma || ''}
                    onChange={(e) => handleMedicalHistoryChange('trauma', e.target.value)}
                    placeholder="Trauma details..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="medications" className="text-sm font-medium">Medication:</Label>
                  <Input
                    id="medications"
                    value={data.medicalHistory?.medications || ''}
                    onChange={(e) => handleMedicalHistoryChange('medications', e.target.value)}
                    placeholder="Current medications..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies" className="text-sm font-medium">Do you have any allergies?</Label>
                  <Textarea
                    id="allergies"
                    value={data.medicalHistory?.allergies || ''}
                    onChange={(e) => handleMedicalHistoryChange('allergies', e.target.value)}
                    placeholder="List any allergies..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Family Medical History */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-primary">Family Medical History</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { key: 'heart_trouble', label: 'Heart Trouble' },
                   { key: 'stroke', label: 'Stroke' },
                   { key: 'diabetes', label: 'Diabetes' },
                   { key: 'cancer', label: 'Cancer' },
                   { key: 'arthritis', label: 'Arthritis' },
                   { key: 'high_blood_pressure', label: 'High Blood Pressure' },
                   { key: 'kidney_disease', label: 'Kidney Disease' },
                   { key: 'mental_illness', label: 'Mental Illness' },
                   { key: 'asthma', label: 'Asthma' },
                   { key: 'epilepsy', label: 'Epilepsy' },
                   { key: 'kyphosis', label: 'Kyphosis' },
                   { key: 'lung_disease', label: 'Lung Disease' },
                   { key: 'osteoporosis', label: 'Osteoporosis' },
                   { key: 'migraines', label: 'Migraines' },
                   { key: 'scoliosis', label: 'Scoliosis' },
                   { key: 'spine_problems', label: 'Spine Problems' }
                 ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                     <Checkbox
                       id={`family-${key}`}
                       checked={Boolean(data.familyHistory?.[key as keyof typeof data.familyHistory])}
                       onCheckedChange={(checked) => handleFamilyHistoryChange(key, Boolean(checked))}
                     />
                    <Label htmlFor={`family-${key}`} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
              
              {/* Other Family Conditions */}
              <div className="space-y-2">
                <Label htmlFor="other-family-conditions" className="text-sm font-medium">
                  Other Family Conditions
                </Label>
                 <Textarea
                   id="other-family-conditions"
                   placeholder="Please specify any other family medical conditions..."
                   value={data.familyHistory?.other_conditions || ''}
                   onChange={(e) => handleFamilyHistoryChange('other_conditions', e.target.value)}
                   className="min-h-[80px]"
                 />
              </div>
            </div>

            <Separator />

          </>
        )}
      </CardContent>
    </Card>
  );
}
