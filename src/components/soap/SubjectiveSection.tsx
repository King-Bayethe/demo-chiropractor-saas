import { useState } from "react";
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
  
  // Enhanced chiropractic fields (optional for backward compatibility)
  mainComplaints?: string[];
  otherComplaint?: string;
  problemStart?: string;
  problemBegin?: string;
  painRating?: number[];
  painBetter?: string;
  painWorse?: string;
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

const commonSymptoms = [
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'pain', label: 'Pain' },
  { id: 'shakiness', label: 'Shakiness' },
  { id: 'shortness_breath', label: 'Shortness of Breath' },
  { id: 'headache', label: 'Headache' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'numbness', label: 'Numbness/Tingling' },
  { id: 'weakness', label: 'Weakness' },
  { id: 'stiffness', label: 'Stiffness' },
  { id: 'swelling', label: 'Swelling' },
  { id: 'burning', label: 'Burning Sensation' }
];

const painFaces = [
  { value: 0, emoji: '😊', label: 'No Pain' },
  { value: 2, emoji: '😐', label: 'Mild' },
  { value: 4, emoji: '😟', label: 'Moderate' },
  { value: 6, emoji: '😣', label: 'Severe' },
  { value: 8, emoji: '😫', label: 'Very Severe' },
  { value: 10, emoji: '😱', label: 'Worst Pain' }
];

export function SubjectiveSection({ data, onChange, patient }: SubjectiveSectionProps) {
  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    const currentSymptoms = data.symptoms || [];
    const newSymptoms = checked 
      ? [...currentSymptoms, symptomId]
      : currentSymptoms.filter(s => s !== symptomId);
    
    onChange({ ...data, symptoms: newSymptoms });
  };

  const handlePainScaleChange = (value: number) => {
    onChange({ ...data, painScale: value });
  };

  const isDisabled = data.isRefused || data.isWithinNormalLimits;

  return (
    <div className="space-y-4">
      {patient && <PatientMedicalSummary patient={patient} />}
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
            {/* Common Symptoms */}
            <div>
              <Label className="text-base font-semibold">Common Symptoms</Label>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
              <div className="grid grid-cols-3 gap-3">
                {commonSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                     <Checkbox
                      id={symptom.id}
                      checked={data.symptoms?.includes(symptom.id) || false}
                      onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked as boolean)}
                    />
                    <Label htmlFor={symptom.id} className="text-sm">{symptom.label}</Label>
                  </div>
                ))}
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

            {/* Pain Description */}
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

            {/* Other Symptoms */}
            <div>
              <Label htmlFor="otherSymptoms" className="text-base font-semibold">Additional Symptoms</Label>
              <p className="text-sm text-muted-foreground mb-2">Describe any other symptoms not listed above</p>
              <Textarea
                id="otherSymptoms"
                value={data.otherSymptoms}
                onChange={(e) => onChange({ ...data, otherSymptoms: e.target.value })}
                placeholder="Patient also reports..."
                rows={3}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
