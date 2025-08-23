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
    
    // Smart mapping for current symptoms
    if (patient.current_symptoms) {
      try {
        const symptoms = typeof patient.current_symptoms === 'string' 
          ? JSON.parse(patient.current_symptoms) 
          : patient.current_symptoms;
        
        if (typeof symptoms === 'object' && symptoms !== null) {
          updatedData.currentSymptoms = { ...updatedData.currentSymptoms, ...symptoms };
          hasUpdates = true;
        }
      } catch (error) {
        console.warn('Failed to parse current symptoms:', error);
      }
    }

    // Smart mapping for family medical history
    if (patient.family_medical_history) {
      try {
        if (typeof patient.family_medical_history === 'string') {
          // Parse text-based family history and map to checkboxes
          const historyText = patient.family_medical_history.toLowerCase();
          const mappedHistory = {
            heart_trouble: historyText.includes('heart') || historyText.includes('cardiac'),
            stroke: historyText.includes('stroke'),
            diabetes: historyText.includes('diabetes'),
            cancer: historyText.includes('cancer'),
            arthritis: historyText.includes('arthritis'),
            high_blood_pressure: historyText.includes('hypertension') || historyText.includes('high blood pressure'),
            kidney_disease: historyText.includes('kidney'),
            mental_illness: historyText.includes('mental') || historyText.includes('depression') || historyText.includes('anxiety'),
            asthma: historyText.includes('asthma'),
            epilepsy: historyText.includes('epilepsy') || historyText.includes('seizure'),
            other_conditions: patient.family_medical_history
          };
          updatedData.familyHistory = { ...updatedData.familyHistory, ...mappedHistory };
          hasUpdates = true;
        } else if (typeof patient.family_medical_history === 'object') {
          updatedData.familyHistory = { ...updatedData.familyHistory, ...patient.family_medical_history };
          hasUpdates = true;
        }
      } catch (error) {
        console.warn('Failed to parse family medical history:', error);
      }
    }
    
    if (hasUpdates) {
      onChange(updatedData);
    }
  };

  // Autofill from patient profile when patient data is available
  useEffect(() => {
    if (patient && Object.keys(data).length === 0) {
      mapPatientDataToSOAP();
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
                    { key: 'arm_weakness', label: 'Arm Weakness' }
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
                    { key: 'leg_numbness', label: 'Leg Numbness' }
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
                    { key: 'appetite_changes', label: 'Appetite Changes' }
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
                  { key: 'epilepsy', label: 'Epilepsy' }
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
