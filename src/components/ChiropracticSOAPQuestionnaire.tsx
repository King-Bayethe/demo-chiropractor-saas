import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, User, Stethoscope, Brain, Clipboard, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewOfSystemsData {
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
}

interface ObjectiveData {
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
}

interface ChiropracticSOAPData {
  // Patient Info
  patientName: string;
  date: string;
  age: string;
  sex: string;
  
  // Subjective
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
  
  // Review of Systems
  reviewOfSystems: ReviewOfSystemsData;
  
  // Objective
  objective: ObjectiveData;
  
  // Assessment
  diagnosis: string;
  secondaryFindings: string;
  
  // Plan
  treatment: string;
  frequency: string;
  homeCare: string;
  followUp: string;
}

interface ChiropracticSOAPQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ChiropracticSOAPData) => void;
  initialData?: Partial<ChiropracticSOAPData>;
}

export function ChiropracticSOAPQuestionnaire({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ChiropracticSOAPQuestionnaireProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ChiropracticSOAPData>({
    patientName: "",
    date: new Date().toISOString().split('T')[0],
    age: "",
    sex: "",
    mainComplaints: [],
    otherComplaint: "",
    problemStart: "",
    problemBegin: "",
    painRating: [5],
    painBetter: "",
    painWorse: "",
    painDescriptions: [],
    painRadiate: "",
    painFrequency: [],
    otherSymptoms: "",
    medications: "",
    reviewOfSystems: {
      neurological: {},
      cardiovascular: {},
      respiratory: {},
      musculoskeletal: {},
      gastrointestinal: {},
      genitourinary: {},
      endocrine: {},
      skinImmune: {},
      mentalHealth: {},
      notes: {
        neurological: "",
        cardiovascular: "",
        respiratory: "",
        musculoskeletal: "",
        gastrointestinal: "",
        genitourinary: "",
        endocrine: "",
        skinImmune: "",
        mentalHealth: "",
      }
    },
    objective: {
      posture: [],
      gait: [],
      gaitOther: "",
      muscleTone: "",
      tenderness: "",
      triggerPoints: "",
      jointFixation: "",
      edema: "",
      edemaLocation: "",
      reflexes: "",
      sensation: "",
      sensationLocation: "",
      strength: "",
      strengthMuscle: "",
      vitalSigns: {
        bp: "",
        hr: "",
        resp: "",
        temp: "",
      },
      rangeOfMotion: {
        cervical: {
          flexion: "",
          extension: "",
          rotation: "",
          lateralFlexion: "",
        },
        thoracic: {
          rotation: "",
          flexionExtension: "",
        },
        lumbar: {
          flexion: "",
          extension: "",
          lateralFlexion: "",
          rotation: "",
        },
      },
      orthopedicTests: {
        slr: "",
        slrAngle: "",
        kemps: "",
        kempsSide: "",
        faber: "",
        faberSide: "",
        yeoman: "",
        otherTests: "",
      },
    },
    diagnosis: "",
    secondaryFindings: "",
    treatment: "",
    frequency: "",
    homeCare: "",
    followUp: "",
    ...initialData
  });

  const handleComplaintChange = (complaint: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      mainComplaints: checked 
        ? [...prev.mainComplaints, complaint]
        : prev.mainComplaints.filter(c => c !== complaint)
    }));
  };

  const handlePainDescriptionChange = (description: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      painDescriptions: checked 
        ? [...prev.painDescriptions, description]
        : prev.painDescriptions.filter(d => d !== description)
    }));
  };

  const handlePainFrequencyChange = (frequency: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      painFrequency: checked 
        ? [...prev.painFrequency, frequency]
        : prev.painFrequency.filter(f => f !== frequency)
    }));
  };

  const handleROSChange = (system: keyof ReviewOfSystemsData['notes'], item: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      reviewOfSystems: {
        ...prev.reviewOfSystems,
        [system]: {
          ...prev.reviewOfSystems[system as keyof Omit<ReviewOfSystemsData, 'notes'>],
          [item]: value
        }
      }
    }));
  };

  const handleROSNotesChange = (system: keyof ReviewOfSystemsData['notes'], value: string) => {
    setFormData(prev => ({
      ...prev,
      reviewOfSystems: {
        ...prev.reviewOfSystems,
        notes: {
          ...prev.reviewOfSystems.notes,
          [system]: value
        }
      }
    }));
  };

  const handlePostureChange = (posture: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        posture: checked 
          ? [...prev.objective.posture, posture]
          : prev.objective.posture.filter(p => p !== posture)
      }
    }));
  };

  const handleGaitChange = (gait: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        gait: checked 
          ? [...prev.objective.gait, gait]
          : prev.objective.gait.filter(g => g !== gait)
      }
    }));
  };

  const handleSave = () => {
    if (!formData.patientName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the patient's name.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: "SOAP Questionnaire Saved",
      description: "Comprehensive chiropractic assessment has been saved successfully.",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[90vh] bg-background border border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Chiropractic SOAP Note Questionnaire
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive assessment form for chiropractic care
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Save Assessment
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Patient Information */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <User className="w-5 h-5" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.patientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                        placeholder="Patient's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Patient's age"
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex</Label>
                      <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subjective Section */}
              <Card className="border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <User className="w-5 h-5" />
                    <span>S - Subjective (Patient's Report)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Complaint */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">1. What is your main complaint or area of pain?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Neck", "Mid-back", "Low back", "Shoulder", "Hip"].map((complaint) => (
                        <div key={complaint} className="flex items-center space-x-2">
                          <Checkbox
                            id={complaint}
                            checked={formData.mainComplaints.includes(complaint)}
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
                        value={formData.otherComplaint}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherComplaint: e.target.value }))}
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
                      value={formData.problemStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, problemStart: e.target.value }))}
                      placeholder="e.g., 3 days ago, last week, 2 months ago"
                    />
                  </div>

                  {/* How it began */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">3. How did it begin?</Label>
                    <RadioGroup 
                      value={formData.problemBegin} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, problemBegin: value }))}
                      className="grid grid-cols-2 gap-3"
                    >
                      {["Gradual", "Sudden", "Injury/accident", "Unknown"].map((option) => (
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
                          value={formData.painRating}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, painRating: value }))}
                          max={10}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm font-medium">10</span>
                      <Badge variant="outline" className="ml-2">
                        {formData.painRating[0]}
                      </Badge>
                    </div>
                  </div>

                  {/* What makes it better/worse */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pain-better" className="text-base font-semibold">5. What makes the pain better?</Label>
                      <Input
                        id="pain-better"
                        value={formData.painBetter}
                        onChange={(e) => setFormData(prev => ({ ...prev, painBetter: e.target.value }))}
                        placeholder="Rest, heat, medication, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pain-worse" className="text-base font-semibold">6. What makes the pain worse?</Label>
                      <Input
                        id="pain-worse"
                        value={formData.painWorse}
                        onChange={(e) => setFormData(prev => ({ ...prev, painWorse: e.target.value }))}
                        placeholder="Movement, sitting, standing, etc."
                      />
                    </div>
                  </div>

                  {/* Pain Description */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">7. Describe the pain (check all that apply):</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Sharp", "Dull", "Achy", "Burning", "Tingling", "Numbness"].map((description) => (
                        <div key={description} className="flex items-center space-x-2">
                          <Checkbox
                            id={description}
                            checked={formData.painDescriptions.includes(description)}
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
                      value={formData.painRadiate}
                      onChange={(e) => setFormData(prev => ({ ...prev, painRadiate: e.target.value }))}
                      placeholder="Down the arm, into the leg, etc."
                    />
                  </div>

                  {/* Pain Frequency */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">9. How often do you feel this pain?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Constant", "Intermittent", "Only with activity", "Morning", "Evening"].map((frequency) => (
                        <div key={frequency} className="flex items-center space-x-2">
                          <Checkbox
                            id={frequency}
                            checked={formData.painFrequency.includes(frequency)}
                            onCheckedChange={(checked) => handlePainFrequencyChange(frequency, checked as boolean)}
                          />
                          <Label htmlFor={frequency} className="text-sm">{frequency}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Symptoms */}
                  <div className="space-y-2">
                    <Label htmlFor="other-symptoms" className="text-base font-semibold">10. Do you have any other symptoms (headaches, dizziness, weakness, etc.)?</Label>
                    <Input
                      id="other-symptoms"
                      value={formData.otherSymptoms}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherSymptoms: e.target.value }))}
                      placeholder="Describe any additional symptoms"
                    />
                  </div>

                  {/* Medications */}
                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-base font-semibold">Please list any medications, vitamins, or supplements you are currently taking:</Label>
                    <Textarea
                      id="medications"
                      value={formData.medications}
                      onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="List all current medications and supplements"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Review of Systems */}
              <Card className="border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-purple-600">
                    <Brain className="w-5 h-5" />
                    <span>Review of Systems</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Please check Yes if you have experienced these symptoms recently or in the past, and No if not.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Neurological System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">1. Neurological System</h3>
                    <div className="space-y-3">
                      {[
                        "Frequent headaches",
                        "Dizziness or balance problems", 
                        "Numbness or tingling",
                        "Weakness in arms or legs",
                        "Tremors or shaking",
                        "Memory or concentration problems"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.neurological[`neuro${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('neurological', `neuro${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`neuro${index + 1}-yes`} />
                              <Label htmlFor={`neuro${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`neuro${index + 1}-no`} />
                              <Label htmlFor={`neuro${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="neuro-notes">Notes:</Label>
                        <Textarea
                          id="neuro-notes"
                          value={formData.reviewOfSystems.notes.neurological}
                          onChange={(e) => handleROSNotesChange('neurological', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cardiovascular System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">2. Cardiovascular System</h3>
                    <div className="space-y-3">
                      {[
                        "Chest pain or tightness",
                        "Irregular heartbeat or palpitations",
                        "Swelling in ankles or feet",
                        "Shortness of breath with activity",
                        "High blood pressure history",
                        "Cold hands/feet or poor circulation"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.cardiovascular[`cardio${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('cardiovascular', `cardio${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`cardio${index + 1}-yes`} />
                              <Label htmlFor={`cardio${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`cardio${index + 1}-no`} />
                              <Label htmlFor={`cardio${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="cardio-notes">Notes:</Label>
                        <Textarea
                          id="cardio-notes"
                          value={formData.reviewOfSystems.notes.cardiovascular}
                          onChange={(e) => handleROSNotesChange('cardiovascular', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Respiratory System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">3. Respiratory System</h3>
                    <div className="space-y-3">
                      {[
                        "Persistent cough",
                        "Wheezing or asthma",
                        "Shortness of breath at rest",
                        "History of bronchitis or pneumonia",
                        "Snoring or sleep apnea"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.respiratory[`resp${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('respiratory', `resp${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`resp${index + 1}-yes`} />
                              <Label htmlFor={`resp${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`resp${index + 1}-no`} />
                              <Label htmlFor={`resp${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="resp-notes">Notes:</Label>
                        <Textarea
                          id="resp-notes"
                          value={formData.reviewOfSystems.notes.respiratory}
                          onChange={(e) => handleROSNotesChange('respiratory', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Musculoskeletal System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">4. Musculoskeletal System</h3>
                    <div className="space-y-3">
                      {[
                        "Joint pain or stiffness",
                        "Muscle weakness",
                        "Back pain",
                        "Neck pain",
                        "Difficulty walking"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.musculoskeletal[`msk${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('musculoskeletal', `msk${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`msk${index + 1}-yes`} />
                              <Label htmlFor={`msk${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`msk${index + 1}-no`} />
                              <Label htmlFor={`msk${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="msk-notes">Notes:</Label>
                        <Textarea
                          id="msk-notes"
                          value={formData.reviewOfSystems.notes.musculoskeletal}
                          onChange={(e) => handleROSNotesChange('musculoskeletal', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gastrointestinal System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">5. Gastrointestinal System</h3>
                    <div className="space-y-3">
                      {[
                        "Frequent heartburn or indigestion",
                        "Abdominal pain",
                        "Constipation",
                        "Diarrhea",
                        "Nausea or vomiting"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.gastrointestinal[`gi${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('gastrointestinal', `gi${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`gi${index + 1}-yes`} />
                              <Label htmlFor={`gi${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`gi${index + 1}-no`} />
                              <Label htmlFor={`gi${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="gi-notes">Notes:</Label>
                        <Textarea
                          id="gi-notes"
                          value={formData.reviewOfSystems.notes.gastrointestinal}
                          onChange={(e) => handleROSNotesChange('gastrointestinal', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Genitourinary System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">6. Genitourinary System</h3>
                    <div className="space-y-3">
                      {[
                        "Pain or burning with urination",
                        "Frequent urination",
                        "Blood in urine",
                        "Loss of bladder control",
                        "Erectile or menstrual issues"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.genitourinary[`gu${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('genitourinary', `gu${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`gu${index + 1}-yes`} />
                              <Label htmlFor={`gu${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`gu${index + 1}-no`} />
                              <Label htmlFor={`gu${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="gu-notes">Notes:</Label>
                        <Textarea
                          id="gu-notes"
                          value={formData.reviewOfSystems.notes.genitourinary}
                          onChange={(e) => handleROSNotesChange('genitourinary', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endocrine/Metabolic */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">7. Endocrine/Metabolic</h3>
                    <div className="space-y-3">
                      {[
                        "Unexplained weight change",
                        "Excessive thirst",
                        "Heat or cold intolerance",
                        "Excessive sweating",
                        "Thyroid problems"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.endocrine[`endo${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('endocrine', `endo${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`endo${index + 1}-yes`} />
                              <Label htmlFor={`endo${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`endo${index + 1}-no`} />
                              <Label htmlFor={`endo${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="endo-notes">Notes:</Label>
                        <Textarea
                          id="endo-notes"
                          value={formData.reviewOfSystems.notes.endocrine}
                          onChange={(e) => handleROSNotesChange('endocrine', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skin & Immune System */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">8. Skin & Immune System</h3>
                    <div className="space-y-3">
                      {[
                        "Rash or itching",
                        "Frequent infections",
                        "Delayed wound healing",
                        "Allergies",
                        "Autoimmune disease history"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.skinImmune[`skin${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('skinImmune', `skin${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`skin${index + 1}-yes`} />
                              <Label htmlFor={`skin${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`skin${index + 1}-no`} />
                              <Label htmlFor={`skin${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="skin-notes">Notes:</Label>
                        <Textarea
                          id="skin-notes"
                          value={formData.reviewOfSystems.notes.skinImmune}
                          onChange={(e) => handleROSNotesChange('skinImmune', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mental/Emotional Health */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">9. Mental/Emotional Health</h3>
                    <div className="space-y-3">
                      {[
                        "Anxiety or nervousness",
                        "Depression",
                        "Trouble sleeping",
                        "Stress impacting daily life"
                      ].map((symptom, index) => (
                        <div key={symptom} className="flex items-center justify-between border-b border-muted pb-2">
                          <span className="text-sm">{symptom}</span>
                          <RadioGroup 
                            value={formData.reviewOfSystems.mentalHealth[`mental${index + 1}`] || ""} 
                            onValueChange={(value) => handleROSChange('mentalHealth', `mental${index + 1}`, value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`mental${index + 1}-yes`} />
                              <Label htmlFor={`mental${index + 1}-yes`} className="text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`mental${index + 1}-no`} />
                              <Label htmlFor={`mental${index + 1}-no`} className="text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor="mental-notes">Notes:</Label>
                        <Textarea
                          id="mental-notes"
                          value={formData.reviewOfSystems.notes.mentalHealth}
                          onChange={(e) => handleROSNotesChange('mentalHealth', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Objective Section */}
              <Card className="border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Stethoscope className="w-5 h-5" />
                    <span>O - Objective (Provider fills in)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* General Observations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">Posture</h3>
                      <div className="space-y-2">
                        {["Normal", "Forward Head", "Rounded Shoulders", "Kyphotic", "Lordotic", "Scoliosis", "Pelvic Tilt"].map((posture) => (
                          <div key={posture} className="flex items-center space-x-2">
                            <Checkbox
                              id={`posture-${posture}`}
                              checked={formData.objective.posture.includes(posture)}
                              onCheckedChange={(checked) => handlePostureChange(posture, checked as boolean)}
                            />
                            <Label htmlFor={`posture-${posture}`} className="text-sm">{posture}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">Gait</h3>
                      <div className="space-y-2">
                        {["Normal", "Antalgic", "Limp", "Shuffling"].map((gait) => (
                          <div key={gait} className="flex items-center space-x-2">
                            <Checkbox
                              id={`gait-${gait}`}
                              checked={formData.objective.gait.includes(gait)}
                              onCheckedChange={(checked) => handleGaitChange(gait, checked as boolean)}
                            />
                            <Label htmlFor={`gait-${gait}`} className="text-sm">{gait}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gait-other">Other:</Label>
                        <Input
                          id="gait-other"
                          value={formData.objective.gaitOther}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, gaitOther: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Range of Motion */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Range of Motion (ROM)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Cervical Spine */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Cervical Spine</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Flexion (Normal ~50°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.cervical.flexion}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    cervical: { ...prev.objective.rangeOfMotion.cervical, flexion: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Extension (Normal ~60°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.cervical.extension}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    cervical: { ...prev.objective.rangeOfMotion.cervical, extension: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Rotation L/R (Normal ~80°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.cervical.rotation}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    cervical: { ...prev.objective.rangeOfMotion.cervical, rotation: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Lateral Flexion L/R (Normal ~45°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.cervical.lateralFlexion}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    cervical: { ...prev.objective.rangeOfMotion.cervical, lateralFlexion: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Thoracic Spine */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Thoracic Spine</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Rotation L/R:</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.thoracic.rotation}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    thoracic: { ...prev.objective.rangeOfMotion.thoracic, rotation: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Flexion/Extension:</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.thoracic.flexionExtension}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    thoracic: { ...prev.objective.rangeOfMotion.thoracic, flexionExtension: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lumbar Spine */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Lumbar Spine</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Flexion (Normal ~60°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.lumbar.flexion}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    lumbar: { ...prev.objective.rangeOfMotion.lumbar, flexion: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Extension (Normal ~25°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.lumbar.extension}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    lumbar: { ...prev.objective.rangeOfMotion.lumbar, extension: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Lateral Flexion L/R (Normal ~25°):</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.lumbar.lateralFlexion}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    lumbar: { ...prev.objective.rangeOfMotion.lumbar, lateralFlexion: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Rotation L/R:</Label>
                            <Input 
                              className="w-20" 
                              value={formData.objective.rangeOfMotion.lumbar.rotation}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: {
                                  ...prev.objective,
                                  rangeOfMotion: {
                                    ...prev.objective.rangeOfMotion,
                                    lumbar: { ...prev.objective.rangeOfMotion.lumbar, rotation: e.target.value }
                                  }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Palpation Findings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Palpation Findings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Muscle Tone:</Label>
                        <RadioGroup 
                          value={formData.objective.muscleTone} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, muscleTone: value }
                          }))}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Normal" id="tone-normal" />
                            <Label htmlFor="tone-normal">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Hypertonic" id="hypertonic" />
                            <Label htmlFor="hypertonic">Hypertonic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Hypotonic" id="hypotonic" />
                            <Label htmlFor="hypotonic">Hypotonic</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenderness">Areas of Tenderness:</Label>
                        <Textarea
                          id="tenderness"
                          value={formData.objective.tenderness}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, tenderness: e.target.value }
                          }))}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trigger-points">Trigger Points:</Label>
                        <Textarea
                          id="trigger-points"
                          value={formData.objective.triggerPoints}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, triggerPoints: e.target.value }
                          }))}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joint-fixation">Joint Fixation/Restriction:</Label>
                        <Textarea
                          id="joint-fixation"
                          value={formData.objective.jointFixation}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, jointFixation: e.target.value }
                          }))}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Edema/Swelling:</Label>
                        <div className="flex items-center space-x-4">
                          <RadioGroup 
                            value={formData.objective.edema} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              objective: { ...prev.objective, edema: value }
                            }))}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Present" id="edema-present" />
                              <Label htmlFor="edema-present">Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Absent" id="edema-absent" />
                              <Label htmlFor="edema-absent">Absent</Label>
                            </div>
                          </RadioGroup>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="edema-location">Location:</Label>
                            <Input
                              id="edema-location"
                              value={formData.objective.edemaLocation}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                objective: { ...prev.objective, edemaLocation: e.target.value }
                              }))}
                              className="w-32"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orthopedic Tests */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Orthopedic Tests</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Label className="w-40">Straight Leg Raise:</Label>
                        <RadioGroup 
                          value={formData.objective.orthopedicTests.slr} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, slr: value }
                            }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Positive" id="slr-pos" />
                            <Label htmlFor="slr-pos">Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Negative" id="slr-neg" />
                            <Label htmlFor="slr-neg">Negative</Label>
                          </div>
                        </RadioGroup>
                        <Label htmlFor="slr-angle">Angle:</Label>
                        <Input
                          id="slr-angle"
                          value={formData.objective.orthopedicTests.slrAngle}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, slrAngle: e.target.value }
                            }
                          }))}
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Label className="w-40">Kemp's Test:</Label>
                        <RadioGroup 
                          value={formData.objective.orthopedicTests.kemps} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, kemps: value }
                            }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Positive" id="kemps-pos" />
                            <Label htmlFor="kemps-pos">Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Negative" id="kemps-neg" />
                            <Label htmlFor="kemps-neg">Negative</Label>
                          </div>
                        </RadioGroup>
                        <Label htmlFor="kemps-side">Side:</Label>
                        <Input
                          id="kemps-side"
                          value={formData.objective.orthopedicTests.kempsSide}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, kempsSide: e.target.value }
                            }
                          }))}
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Label className="w-40">FABER/Patrick's Test:</Label>
                        <RadioGroup 
                          value={formData.objective.orthopedicTests.faber} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, faber: value }
                            }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Positive" id="faber-pos" />
                            <Label htmlFor="faber-pos">Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Negative" id="faber-neg" />
                            <Label htmlFor="faber-neg">Negative</Label>
                          </div>
                        </RadioGroup>
                        <Label htmlFor="faber-side">Side:</Label>
                        <Input
                          id="faber-side"
                          value={formData.objective.orthopedicTests.faberSide}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, faberSide: e.target.value }
                            }
                          }))}
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Label className="w-40">Yeoman's Test:</Label>
                        <RadioGroup 
                          value={formData.objective.orthopedicTests.yeoman} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, yeoman: value }
                            }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Positive" id="yeoman-pos" />
                            <Label htmlFor="yeoman-pos">Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Negative" id="yeoman-neg" />
                            <Label htmlFor="yeoman-neg">Negative</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="other-tests">Other tests performed:</Label>
                        <Textarea
                          id="other-tests"
                          value={formData.objective.orthopedicTests.otherTests}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              orthopedicTests: { ...prev.objective.orthopedicTests, otherTests: e.target.value }
                            }
                          }))}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Neurological Findings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Neurological Findings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reflexes">Reflexes:</Label>
                        <Textarea
                          id="reflexes"
                          value={formData.objective.reflexes}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, reflexes: e.target.value }
                          }))}
                          placeholder="Biceps (C5), Brachioradialis (C6), Triceps (C7), Patellar (L4), Achilles (S1)"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sensation:</Label>
                        <RadioGroup 
                          value={formData.objective.sensation} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, sensation: value }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Intact" id="sensation-intact" />
                            <Label htmlFor="sensation-intact">Intact</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Altered" id="sensation-altered" />
                            <Label htmlFor="sensation-altered">Altered</Label>
                          </div>
                        </RadioGroup>
                        <div className="space-y-2">
                          <Label htmlFor="sensation-location">Location:</Label>
                          <Input
                            id="sensation-location"
                            value={formData.objective.sensationLocation}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              objective: { ...prev.objective, sensationLocation: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Strength:</Label>
                        <RadioGroup 
                          value={formData.objective.strength} 
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            objective: { ...prev.objective, strength: value }
                          }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Normal" id="strength-normal" />
                            <Label htmlFor="strength-normal">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Weak" id="strength-weak" />
                            <Label htmlFor="strength-weak">Weak</Label>
                          </div>
                        </RadioGroup>
                        <div className="space-y-2">
                          <Label htmlFor="strength-muscle">Muscle group:</Label>
                          <Input
                            id="strength-muscle"
                            value={formData.objective.strengthMuscle}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              objective: { ...prev.objective, strengthMuscle: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Vital Signs (if taken)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bp">BP:</Label>
                        <Input
                          id="bp"
                          placeholder="mmHg"
                          value={formData.objective.vitalSigns.bp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              vitalSigns: { ...prev.objective.vitalSigns, bp: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hr">HR:</Label>
                        <Input
                          id="hr"
                          placeholder="bpm"
                          value={formData.objective.vitalSigns.hr}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              vitalSigns: { ...prev.objective.vitalSigns, hr: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resp">Resp:</Label>
                        <Input
                          id="resp"
                          placeholder="/min"
                          value={formData.objective.vitalSigns.resp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              vitalSigns: { ...prev.objective.vitalSigns, resp: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temp">Temp:</Label>
                        <Input
                          id="temp"
                          placeholder="°F/°C"
                          value={formData.objective.vitalSigns.temp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              vitalSigns: { ...prev.objective.vitalSigns, temp: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Section */}
              <Card className="border-orange-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-orange-600">
                    <Clipboard className="w-5 h-5" />
                    <span>A - Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Working Diagnosis:</Label>
                    <Textarea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-findings">Secondary Findings:</Label>
                    <Textarea
                      id="secondary-findings"
                      value={formData.secondaryFindings}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryFindings: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Plan Section */}
              <Card className="border-violet-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-violet-600">
                    <Calendar className="w-5 h-5" />
                    <span>P - Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment provided today:</Label>
                    <Textarea
                      id="treatment"
                      value={formData.treatment}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency/Duration of Care:</Label>
                    <Textarea
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home-care">Home Care Instructions:</Label>
                    <Textarea
                      id="home-care"
                      value={formData.homeCare}
                      onChange={(e) => setFormData(prev => ({ ...prev, homeCare: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="follow-up">Follow-up Appointment:</Label>
                    <Input
                      id="follow-up"
                      value={formData.followUp}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUp: e.target.value }))}
                      placeholder="Date and time for next appointment"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
