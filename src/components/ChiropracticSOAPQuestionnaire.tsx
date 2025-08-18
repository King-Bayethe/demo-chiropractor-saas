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
  
  // Objective
  posture: string;
  rom: string;
  palpation: string;
  orthoNeuro: string;
  
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
    posture: "",
    rom: "",
    palpation: "",
    orthoNeuro: "",
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
      description: "Chiropractic assessment has been saved successfully.",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[90vh] bg-background border border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-medical-blue-light">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-medical-blue rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-blue-dark">
                  Chiropractic SOAP Note Questionnaire
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive assessment form for chiropractic care
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} className="bg-medical-blue hover:bg-medical-blue-dark">
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
              <Card className="border-medical-blue/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-medical-blue-dark">
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
              <Card className="border-medical-teal/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-medical-teal">
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

              {/* Objective Section */}
              <Card className="border-medical-green/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-medical-green">
                    <Stethoscope className="w-5 h-5" />
                    <span>O - Objective (Provider fills in)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="posture" className="text-base font-semibold">Posture/Observation:</Label>
                    <Textarea
                      id="posture"
                      value={formData.posture}
                      onChange={(e) => setFormData(prev => ({ ...prev, posture: e.target.value }))}
                      placeholder="Postural observations and gait analysis"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rom" className="text-base font-semibold">Range of Motion:</Label>
                    <Textarea
                      id="rom"
                      value={formData.rom}
                      onChange={(e) => setFormData(prev => ({ ...prev, rom: e.target.value }))}
                      placeholder="Range of motion findings and limitations"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="palpation" className="text-base font-semibold">Palpation Findings:</Label>
                    <Textarea
                      id="palpation"
                      value={formData.palpation}
                      onChange={(e) => setFormData(prev => ({ ...prev, palpation: e.target.value }))}
                      placeholder="Muscle tension, trigger points, tenderness"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ortho-neuro" className="text-base font-semibold">Orthopedic/Neurological Tests:</Label>
                    <Textarea
                      id="ortho-neuro"
                      value={formData.orthoNeuro}
                      onChange={(e) => setFormData(prev => ({ ...prev, orthoNeuro: e.target.value }))}
                      placeholder="Special tests performed and results"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Section */}
              <Card className="border-medical-orange/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-medical-orange">
                    <Brain className="w-5 h-5" />
                    <span>A - Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis" className="text-base font-semibold">Working Diagnosis:</Label>
                    <Textarea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Primary diagnosis and clinical impression"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-findings" className="text-base font-semibold">Secondary Findings:</Label>
                    <Textarea
                      id="secondary-findings"
                      value={formData.secondaryFindings}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryFindings: e.target.value }))}
                      placeholder="Additional findings and considerations"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Plan Section */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Clipboard className="w-5 h-5" />
                    <span>P - Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="treatment" className="text-base font-semibold">Treatment provided today:</Label>
                    <Textarea
                      id="treatment"
                      value={formData.treatment}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                      placeholder="Specific treatments and adjustments performed"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-base font-semibold">Frequency/Duration of Care:</Label>
                    <Textarea
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="Recommended frequency and duration of treatment"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home-care" className="text-base font-semibold">Home Care Instructions:</Label>
                    <Textarea
                      id="home-care"
                      value={formData.homeCare}
                      onChange={(e) => setFormData(prev => ({ ...prev, homeCare: e.target.value }))}
                      placeholder="Exercise recommendations, lifestyle modifications"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="follow-up" className="text-base font-semibold">Follow-up Appointment:</Label>
                    <Input
                      id="follow-up"
                      value={formData.followUp}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUp: e.target.value }))}
                      placeholder="Next appointment date/timeframe"
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
