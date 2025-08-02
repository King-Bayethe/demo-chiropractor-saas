import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, X, AlertTriangle } from "lucide-react";

interface PlanSectionProps {
  data: PlanData;
  onChange: (data: PlanData) => void;
}

export interface Medication {
  genericName: string;
  brandName: string;
  strength: string;
  quantity: string;
  frequency: string;
  refills: string;
  diagnosisCode: string;
  isPrescribed: boolean;
}

export interface PlanData {
  treatments: string[];
  customTreatment: string;
  medications: Medication[];
  followUpPeriod: string;
  customFollowUp: string;
  hasEmergencyDisclaimer: boolean;
  legalTags: string[];
  additionalInstructions: string;
}

const treatmentOptions = [
  'Chiropractic adjustments',
  'Manual therapy',
  'Soft tissue therapy',
  'Physical therapy exercises',
  'Home exercise program',
  'Stretching routine',
  'Ice therapy',
  'Heat therapy',
  'Ergonomic modifications',
  'Activity modification',
  'Rest and avoid aggravating activities',
  'Massage therapy',
  'Acupuncture',
  'Ultrasound therapy',
  'Electrical stimulation'
];

const followUpOptions = [
  { value: '3-days', label: '3 days' },
  { value: '1-week', label: '1 week' },
  { value: '2-weeks', label: '2 weeks' },
  { value: '3-weeks', label: '3 weeks' },
  { value: '1-month', label: '1 month' },
  { value: 'prn', label: 'PRN (as needed)' },
  { value: 'custom', label: 'Custom' }
];

const legalTagOptions = [
  'PIP (Personal Injury Protection)',
  'MVA (Motor Vehicle Accident)',
  'Work-related injury',
  'Litigation pending',
  'Independent Medical Exam',
  'Disability evaluation',
  'Pre-existing condition',
  'Return to work evaluation'
];

export function PlanSection({ data, onChange }: PlanSectionProps) {
  const [showEPrescribing, setShowEPrescribing] = useState(false);

  const handleTreatmentChange = (treatment: string, checked: boolean) => {
    const newTreatments = checked
      ? [...data.treatments, treatment]
      : data.treatments.filter(t => t !== treatment);
    
    onChange({ ...data, treatments: newTreatments });
  };

  const addMedication = () => {
    onChange({
      ...data,
      medications: [...data.medications, {
        genericName: '',
        brandName: '',
        strength: '',
        quantity: '',
        frequency: '',
        refills: '',
        diagnosisCode: '',
        isPrescribed: false
      }]
    });
  };

  const updateMedication = (index: number, updates: Partial<Medication>) => {
    const newMedications = data.medications.map((med, i) => 
      i === index ? { ...med, ...updates } : med
    );
    onChange({ ...data, medications: newMedications });
  };

  const removeMedication = (index: number) => {
    onChange({
      ...data,
      medications: data.medications.filter((_, i) => i !== index)
    });
  };

  const handleLegalTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...data.legalTags, tag]
      : data.legalTags.filter(t => t !== tag);
    
    onChange({ ...data, legalTags: newTags });
  };

  const emergencyDisclaimer = "Seek immediate emergency care if you experience severe worsening of symptoms, loss of bowel/bladder control, progressive weakness, or any concerning neurological changes.";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">P - Plan</CardTitle>
        <p className="text-sm text-muted-foreground">Treatment plan and next steps</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Options */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Treatment Interventions</Label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {treatmentOptions.map((treatment) => (
              <div key={treatment} className="flex items-center space-x-2">
                <Checkbox
                  id={treatment}
                  checked={data.treatments.includes(treatment)}
                  onCheckedChange={(checked) => handleTreatmentChange(treatment, checked as boolean)}
                />
                <Label htmlFor={treatment} className="text-sm">{treatment}</Label>
              </div>
            ))}
          </div>
          
          <div>
            <Label htmlFor="customTreatment" className="text-sm mb-2 block">Additional Treatment Notes</Label>
            <Textarea
              id="customTreatment"
              value={data.customTreatment}
              onChange={(e) => onChange({ ...data, customTreatment: e.target.value })}
              placeholder="Specify frequency, duration, or additional treatment details..."
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Medications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Medications</Label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="eprescribing"
                  checked={showEPrescribing}
                  onCheckedChange={setShowEPrescribing}
                />
                <Label htmlFor="eprescribing" className="text-sm">E-Prescribing</Label>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="w-4 h-4 mr-1" />
                Add Medication
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.medications.map((medication, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Medication {index + 1}</Badge>
                    {showEPrescribing && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`prescribe-${index}`}
                          checked={medication.isPrescribed}
                          onCheckedChange={(checked) => updateMedication(index, { isPrescribed: checked as boolean })}
                        />
                        <Label htmlFor={`prescribe-${index}`} className="text-sm">Send E-Prescription</Label>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Generic Name *</Label>
                    <Input
                      value={medication.genericName}
                      onChange={(e) => updateMedication(index, { genericName: e.target.value })}
                      placeholder="Ibuprofen"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Brand Name</Label>
                    <Input
                      value={medication.brandName}
                      onChange={(e) => updateMedication(index, { brandName: e.target.value })}
                      placeholder="Advil, Motrin"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Strength</Label>
                    <Input
                      value={medication.strength}
                      onChange={(e) => updateMedication(index, { strength: e.target.value })}
                      placeholder="200mg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      value={medication.quantity}
                      onChange={(e) => updateMedication(index, { quantity: e.target.value })}
                      placeholder="30 tablets"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Frequency (Sig)</Label>
                    <Input
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, { frequency: e.target.value })}
                      placeholder="Take 1 tablet TID"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Refills</Label>
                    <Input
                      value={medication.refills}
                      onChange={(e) => updateMedication(index, { refills: e.target.value })}
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Linked Diagnosis</Label>
                    <Input
                      value={medication.diagnosisCode}
                      onChange={(e) => updateMedication(index, { diagnosisCode: e.target.value })}
                      placeholder="M54.5"
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.medications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No medications prescribed</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Follow-up */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Follow-up Schedule</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Return Visit</Label>
              <Select
                value={data.followUpPeriod}
                onValueChange={(value) => onChange({ ...data, followUpPeriod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select follow-up period" />
                </SelectTrigger>
                <SelectContent>
                  {followUpOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {data.followUpPeriod === 'custom' && (
              <div>
                <Label className="text-sm mb-2 block">Custom Follow-up</Label>
                <Input
                  value={data.customFollowUp}
                  onChange={(e) => onChange({ ...data, customFollowUp: e.target.value })}
                  placeholder="Specify custom follow-up schedule"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Emergency Disclaimer */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Emergency Care Disclaimer</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="emergency-disclaimer"
                checked={data.hasEmergencyDisclaimer}
                onCheckedChange={(checked) => onChange({ ...data, hasEmergencyDisclaimer: checked })}
              />
              <Label htmlFor="emergency-disclaimer" className="text-sm">Include disclaimer</Label>
            </div>
          </div>
          
          {data.hasEmergencyDisclaimer && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{emergencyDisclaimer}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Legal Tags */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Legal/Insurance Tags</Label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {legalTagOptions.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={data.legalTags.includes(tag)}
                  onCheckedChange={(checked) => handleLegalTagChange(tag, checked as boolean)}
                />
                <Label htmlFor={tag} className="text-sm">{tag}</Label>
              </div>
            ))}
          </div>
          
          {data.legalTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.legalTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Additional Instructions */}
        <div>
          <Label htmlFor="additionalInstructions" className="text-base font-semibold">Additional Instructions</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Patient education, restrictions, and specific guidance
          </p>
          <Textarea
            id="additionalInstructions"
            value={data.additionalInstructions}
            onChange={(e) => onChange({ ...data, additionalInstructions: e.target.value })}
            placeholder="Patient education provided regarding proper lifting mechanics, posture awareness, and activity modifications. Avoid heavy lifting >20 lbs for 2 weeks..."
            rows={4}
          />
        </div>

        {/* Plan Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Plan Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Treatments:</span>
              <p className="font-medium">{data.treatments.length} selected</p>
            </div>
            <div>
              <span className="text-muted-foreground">Medications:</span>
              <p className="font-medium">{data.medications.length} prescribed</p>
            </div>
            <div>
              <span className="text-muted-foreground">Follow-up:</span>
              <p className="font-medium">
                {data.followUpPeriod ? followUpOptions.find(opt => opt.value === data.followUpPeriod)?.label || data.customFollowUp : 'Not scheduled'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}