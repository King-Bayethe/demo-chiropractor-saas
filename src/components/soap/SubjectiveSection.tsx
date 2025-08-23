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

            <Separator />

          </>
        )}
      </CardContent>
    </Card>
  );
}
