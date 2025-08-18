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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User } from "lucide-react";

interface ChiropracticSubjectiveSectionProps {
  data: ChiropracticSubjectiveData;
  onChange: (data: ChiropracticSubjectiveData) => void;
}

export interface ChiropracticSubjectiveData {
  // Main Complaints
  mainComplaints: string[];
  otherComplaint: string;
  
  // Problem History
  problemStart: string;
  problemBegin: string;
  
  // Pain Assessment
  painRating: number[];
  painBetter: string;
  painWorse: string;
  painDescriptions: string[];
  painRadiate: string;
  painFrequency: string[];
  
  // Additional Information
  otherSymptoms: string;
  medications: string;
  
  // Review of Systems
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
  
  // Control flags
  isRefused: boolean;
  isWithinNormalLimits: boolean;
}

const mainComplaintOptions = ["Neck", "Mid-back", "Low back", "Shoulder", "Hip"];
const problemBeginOptions = ["Gradual", "Sudden", "Injury/accident", "Unknown"];
const painDescriptionOptions = ["Sharp", "Dull", "Achy", "Burning", "Tingling", "Numbness"];
const painFrequencyOptions = ["Constant", "Intermittent", "Only with activity", "Morning", "Evening"];

const reviewOfSystemsConfig = {
  neurological: {
    title: "Neurological",
    questions: ["Headaches", "Dizziness", "Numbness", "Weakness", "Tremors", "Memory issues"]
  },
  cardiovascular: {
    title: "Cardiovascular", 
    questions: ["Chest pain", "Palpitations", "Swelling", "Shortness of breath", "High blood pressure"]
  },
  respiratory: {
    title: "Respiratory",
    questions: ["Cough", "Wheezing", "Breathing difficulties", "Asthma"]
  },
  musculoskeletal: {
    title: "Musculoskeletal",
    questions: ["Joint pain", "Stiffness", "Swelling", "Muscle weakness", "Previous injuries"]
  },
  gastrointestinal: {
    title: "Gastrointestinal", 
    questions: ["Poor appetite", "Nausea", "Bowel changes", "Abdominal pain"]
  },
  genitourinary: {
    title: "Genitourinary",
    questions: ["Frequent urination", "Urgency", "Pain with urination", "Reproductive issues"]
  },
  endocrine: {
    title: "Endocrine",
    questions: ["Fatigue", "Weight changes", "Temperature sensitivity", "Excessive thirst"]
  },
  skinImmune: {
    title: "Skin/Immune",
    questions: ["Rashes", "Allergies", "Frequent infections", "Poor healing"]
  },
  mentalHealth: {
    title: "Mental Health",
    questions: ["Mood changes", "Sleep problems", "Anxiety", "High stress levels"]
  }
};

export function ChiropracticSubjectiveSection({ data, onChange }: ChiropracticSubjectiveSectionProps) {
  const [openSystems, setOpenSystems] = useState<string[]>([]);

  const handleComplaintChange = (complaint: string, checked: boolean) => {
    const newComplaints = checked 
      ? [...data.mainComplaints, complaint]
      : data.mainComplaints.filter(c => c !== complaint);
    onChange({ ...data, mainComplaints: newComplaints });
  };

  const handlePainDescriptionChange = (description: string, checked: boolean) => {
    const newDescriptions = checked 
      ? [...data.painDescriptions, description]
      : data.painDescriptions.filter(d => d !== description);
    onChange({ ...data, painDescriptions: newDescriptions });
  };

  const handlePainFrequencyChange = (frequency: string, checked: boolean) => {
    const newFrequency = checked 
      ? [...data.painFrequency, frequency]
      : data.painFrequency.filter(f => f !== frequency);
    onChange({ ...data, painFrequency: newFrequency });
  };

  const handleROSChange = (system: keyof typeof reviewOfSystemsConfig, item: string, value: string) => {
    onChange({
      ...data,
      reviewOfSystems: {
        ...data.reviewOfSystems,
        [system]: {
          ...data.reviewOfSystems[system as keyof typeof data.reviewOfSystems],
          [item]: value
        }
      }
    });
  };

  const handleROSNotesChange = (system: keyof typeof reviewOfSystemsConfig, value: string) => {
    onChange({
      ...data,
      reviewOfSystems: {
        ...data.reviewOfSystems,
        notes: {
          ...data.reviewOfSystems.notes,
          [system]: value
        }
      }
    });
  };

  const toggleSystem = (system: string) => {
    setOpenSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const isDisabled = data.isRefused || data.isWithinNormalLimits;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <User className="w-5 h-5" />
              <span>S - Subjective (Chiropractic Assessment)</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Comprehensive patient-reported symptoms and history</p>
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
            {/* Main Complaint */}
            <div>
              <Label className="text-base font-semibold mb-3 block">1. What is your main complaint or area of pain?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {mainComplaintOptions.map((complaint) => (
                  <div key={complaint} className="flex items-center space-x-2">
                    <Checkbox
                      id={complaint}
                      checked={data.mainComplaints.includes(complaint)}
                      onCheckedChange={(checked) => handleComplaintChange(complaint, checked as boolean)}
                    />
                    <Label htmlFor={complaint} className="text-sm">{complaint}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-complaint">Other:</Label>
                <Input
                  id="other-complaint"
                  value={data.otherComplaint}
                  onChange={(e) => onChange({ ...data, otherComplaint: e.target.value })}
                  placeholder="Specify other areas of concern"
                />
              </div>
            </div>

            <Separator />

            {/* Problem Start */}
            <div className="space-y-2">
              <Label htmlFor="problem-start" className="text-base font-semibold">2. When did the problem start?</Label>
              <Input
                id="problem-start"
                value={data.problemStart}
                onChange={(e) => onChange({ ...data, problemStart: e.target.value })}
                placeholder="e.g., 3 days ago, last week, 2 months ago"
              />
            </div>

            {/* How it began */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">3. How did it begin?</Label>
              <RadioGroup 
                value={data.problemBegin} 
                onValueChange={(value) => onChange({ ...data, problemBegin: value })}
                className="grid grid-cols-2 gap-3"
              >
                {problemBeginOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-sm">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Pain Rating */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">4. How would you rate your pain? (0 = none, 10 = worst)</Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">0</span>
                <div className="flex-1">
                  <Slider
                    value={data.painRating}
                    onValueChange={(value) => onChange({ ...data, painRating: value })}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-sm font-medium">10</span>
                <Badge variant="outline" className="ml-2">
                  {data.painRating[0]}
                </Badge>
              </div>
            </div>

            {/* What makes it better/worse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pain-better" className="text-base font-semibold">5. What makes the pain better?</Label>
                <Input
                  id="pain-better"
                  value={data.painBetter}
                  onChange={(e) => onChange({ ...data, painBetter: e.target.value })}
                  placeholder="Rest, heat, medication, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pain-worse" className="text-base font-semibold">6. What makes the pain worse?</Label>
                <Input
                  id="pain-worse"
                  value={data.painWorse}
                  onChange={(e) => onChange({ ...data, painWorse: e.target.value })}
                  placeholder="Movement, sitting, standing, etc."
                />
              </div>
            </div>

            {/* Pain Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">7. Describe the pain (check all that apply):</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {painDescriptionOptions.map((description) => (
                  <div key={description} className="flex items-center space-x-2">
                    <Checkbox
                      id={description}
                      checked={data.painDescriptions.includes(description)}
                      onCheckedChange={(checked) => handlePainDescriptionChange(description, checked as boolean)}
                    />
                    <Label htmlFor={description} className="text-sm">{description}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Radiation */}
            <div className="space-y-2">
              <Label htmlFor="pain-radiate" className="text-base font-semibold">8. Does the pain radiate anywhere? If yes, where?</Label>
              <Input
                id="pain-radiate"
                value={data.painRadiate}
                onChange={(e) => onChange({ ...data, painRadiate: e.target.value })}
                placeholder="Down the arm, into the leg, etc."
              />
            </div>

            {/* Pain Frequency */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">9. How often do you feel this pain?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {painFrequencyOptions.map((frequency) => (
                  <div key={frequency} className="flex items-center space-x-2">
                    <Checkbox
                      id={frequency}
                      checked={data.painFrequency.includes(frequency)}
                      onCheckedChange={(checked) => handlePainFrequencyChange(frequency, checked as boolean)}
                    />
                    <Label htmlFor={frequency} className="text-sm">{frequency}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="other-symptoms" className="text-base font-semibold">10. Do you have any other symptoms?</Label>
              <Input
                id="other-symptoms"
                value={data.otherSymptoms}
                onChange={(e) => onChange({ ...data, otherSymptoms: e.target.value })}
                placeholder="Describe any additional symptoms"
              />
            </div>

            {/* Medications */}
            <div className="space-y-2">
              <Label htmlFor="medications" className="text-base font-semibold">Current medications, vitamins, or supplements:</Label>
              <Textarea
                id="medications"
                value={data.medications}
                onChange={(e) => onChange({ ...data, medications: e.target.value })}
                placeholder="List all current medications and supplements"
                rows={3}
              />
            </div>

            <Separator />

            {/* Review of Systems */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Review of Systems</Label>
              <div className="space-y-2">
                {Object.entries(reviewOfSystemsConfig).map(([systemKey, system]) => {
                  const isOpen = openSystems.includes(systemKey);
                  
                  return (
                    <Collapsible key={systemKey} open={isOpen} onOpenChange={() => toggleSystem(systemKey)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                          <span className="font-medium">{system.title}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="space-y-3 border-l-2 border-border/50 pl-4">
                          <div className="grid grid-cols-2 gap-2">
                            {system.questions.map((question) => (
                              <div key={question} className="flex items-center space-x-2">
                                <Label className="text-sm flex-1">{question}:</Label>
                                <RadioGroup
                                  value={data.reviewOfSystems[systemKey as keyof typeof data.reviewOfSystems][question] || ""}
                                  onValueChange={(value) => handleROSChange(systemKey as keyof typeof reviewOfSystemsConfig, question, value)}
                                  className="flex space-x-2"
                                >
                                  <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="yes" id={`${systemKey}-${question}-yes`} />
                                    <Label htmlFor={`${systemKey}-${question}-yes`} className="text-xs">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="no" id={`${systemKey}-${question}-no`} />
                                    <Label htmlFor={`${systemKey}-${question}-no`} className="text-xs">No</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            ))}
                          </div>
                          <Textarea
                            value={data.reviewOfSystems.notes[systemKey as keyof typeof data.reviewOfSystems.notes]}
                            onChange={(e) => handleROSNotesChange(systemKey as keyof typeof reviewOfSystemsConfig, e.target.value)}
                            placeholder={`Additional ${system.title.toLowerCase()} notes...`}
                            rows={2}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
