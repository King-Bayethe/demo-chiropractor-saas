import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PatientProfileHeader } from "./PatientProfileHeader";
import { SubjectiveSection, SubjectiveData } from "./SubjectiveSection";
import { ObjectiveSection, ObjectiveData } from "./ObjectiveSection";
import { AssessmentSection, AssessmentData } from "./AssessmentSection";
import { PlanSection, PlanData } from "./PlanSection";
import { SmartTemplates } from "./SmartTemplates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SOAPDataConverter, WizardData as UnifiedWizardData } from "@/types/soap";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  User, 
  Clipboard, 
  Stethoscope, 
  Target, 
  Calendar,
  Clock,
  Save,
  Sparkles
} from "lucide-react";

interface SOAPWizardProps {
  patient: any;
  onSave: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

// Remove duplicate WizardData interface - using the one from types/soap.ts
type LocalWizardData = {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  dateCreated: Date;
  chiefComplaint: string;
  isQuickNote: boolean;
  isReferral: boolean;
  subjective: SubjectiveData;
  objective: ObjectiveData;
  assessment: AssessmentData;
  plan: PlanData;
};

const STEPS = [
  { id: 'overview', title: 'Patient Overview', icon: User, description: 'Review patient information and chief complaint' },
  { id: 'subjective', title: 'Subjective', icon: Clipboard, description: 'Patient-reported symptoms and history' },
  { id: 'objective', title: 'Objective', icon: Stethoscope, description: 'Physical examination and vital signs' },
  { id: 'assessment', title: 'Assessment', icon: Target, description: 'Clinical diagnosis and evaluation' },
  { id: 'plan', title: 'Plan', icon: Calendar, description: 'Treatment plan and follow-up' }
];

export function SOAPWizard({ patient, onSave, onBack, initialData }: SOAPWizardProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  
  const [wizardData, setWizardData] = useState<LocalWizardData>({
    patientId: patient?.id || "",
    patientName: getPatientName(patient),
    providerId: "dr-silverman",
    providerName: "Dr. Silverman",
    dateCreated: new Date(),
    chiefComplaint: "",
    isQuickNote: false,
    isReferral: false,
    subjective: {
      symptoms: [],
      painScale: null,
      painDescription: "",
      otherSymptoms: "",
      isRefused: false,
      isWithinNormalLimits: false,
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
      }
    },
    objective: {
      vitalSigns: {
        height: "",
        weight: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: ""
      },
      systemExams: [],
      specialTests: [],
      imagingLabs: [],
      procedures: [],
      posture: [],
      gait: [],
      gaitOther: "",
      muscleTone: "",
      tenderness: "",
      spasm: "",
      swelling: "",
      rangeOfMotion: [],
      orthopedicTests: [],
      neurologicalAssessment: {
        cranialNerves: "",
        motorFunction: "",
        sensoryFunction: "",
        reflexes: "",
        coordination: "",
        notes: ""
      }
    },
    assessment: {
      diagnoses: [],
      clinicalImpression: ""
    },
    plan: {
      treatments: [],
      customTreatment: "",
      medications: [],
      followUpPeriod: "",
      customFollowUp: "",
      hasEmergencyDisclaimer: true,
      legalTags: [],
      additionalInstructions: ""
    }
  });

  // Auto-save functionality
  const draftKey = `soap_wizard_${patient?.id || 'new'}`;
  const { saveNow, hasDraft, clearDraft } = useAutoSave({
    key: draftKey,
    data: wizardData,
    interval: 30000,
    enabled: true
  });

  useEffect(() => {
    if (initialData) {
      setWizardData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  function getPatientName(patient: any): string {
    if (!patient) return 'Unknown Patient';
    
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || patient.email || 'Unknown Patient';
  }

  const getPatientDisplayData = () => {
    return patient;
  };

  const calculateProgress = () => {
    const totalSteps = STEPS.length;
    const completedSteps = completed.size + (currentStep > 0 ? 1 : 0);
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Overview
        return !!wizardData.chiefComplaint.trim();
      case 1: // Subjective
        return wizardData.subjective.mainComplaints.length > 0 || 
               !!wizardData.subjective.otherComplaint ||
               !!wizardData.subjective.problemStart ||
               wizardData.subjective.isRefused || 
               wizardData.subjective.isWithinNormalLimits;
      case 2: // Objective
        return Object.values(wizardData.objective.vitalSigns).some(v => v) || 
               wizardData.objective.posture.length > 0 ||
               wizardData.objective.gait.length > 0 ||
               wizardData.objective.rangeOfMotion.length > 0 ||
               wizardData.objective.systemExams.length > 0;
      case 3: // Assessment
        return wizardData.assessment.diagnoses.length > 0 || 
               !!wizardData.assessment.clinicalImpression;
      case 4: // Plan
        return wizardData.plan.treatments.length > 0 || 
               wizardData.plan.medications.length > 0 || 
               !!wizardData.plan.additionalInstructions;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepComplete(currentStep)) {
      setCompleted(prev => new Set([...prev, currentStep]));
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSave = () => {
    console.log('SOAPWizard handleSave - Current wizardData:', wizardData);
    console.log('SOAPWizard handleSave - wizardData type and keys:', typeof wizardData, Object.keys(wizardData || {}));
    console.log('SOAPWizard handleSave - wizardData JSON size:', JSON.stringify(wizardData).length, 'characters');
    
    // Convert local wizard data to unified format with type compatibility
    const unifiedWizardData: UnifiedWizardData = {
      patientOverview: {
        chiefComplaint: wizardData.chiefComplaint,
        dateOfService: wizardData.dateCreated,
        appointmentType: 'regular'
      },
      subjective: wizardData.subjective,
      objective: wizardData.objective as any, // Use type assertion for compatibility
      assessment: wizardData.assessment as any, // Use type assertion for compatibility
      plan: wizardData.plan as any // Use type assertion for compatibility
    };
    
    const unifiedData = SOAPDataConverter.wizardToUnified(
      unifiedWizardData, 
      patient.id, 
      "Dr. Silverman"
    );
    
    console.log('SOAPWizard handleSave - Converted to unified format:', unifiedData);
    
    onSave(unifiedData);
    clearDraft();
  };

  const applyTemplate = (template: any) => {
    // Enhanced template application for chiropractic data
    const chiropracticData = template.chiropracticTemplate;
    
    setWizardData(prev => ({
      ...prev,
      chiefComplaint: template.template?.subjective?.chiefComplaint || template.chiefComplaint || prev.chiefComplaint,
      subjective: chiropracticData?.subjective ? {
        ...prev.subjective,
        mainComplaints: chiropracticData.subjective.mainComplaints || prev.subjective.mainComplaints,
        otherComplaint: chiropracticData.subjective.otherComplaint || prev.subjective.otherComplaint,
        problemStart: chiropracticData.subjective.problemStart || prev.subjective.problemStart,
        problemBegin: chiropracticData.subjective.problemBegin || prev.subjective.problemBegin,
        painRating: chiropracticData.subjective.painRating || prev.subjective.painRating,
        painBetter: chiropracticData.subjective.painBetter || prev.subjective.painBetter,
        painWorse: chiropracticData.subjective.painWorse || prev.subjective.painWorse,
        painDescriptions: chiropracticData.subjective.painDescriptions || prev.subjective.painDescriptions,
        painRadiate: chiropracticData.subjective.painRadiate || prev.subjective.painRadiate,
        painFrequency: chiropracticData.subjective.painFrequency || prev.subjective.painFrequency,
        otherSymptoms: chiropracticData.subjective.otherSymptoms || prev.subjective.otherSymptoms,
        medications: chiropracticData.subjective.medications || prev.subjective.medications,
        reviewOfSystems: chiropracticData.subjective.reviewOfSystems || prev.subjective.reviewOfSystems
      } : {
        ...prev.subjective,
        mainComplaints: template.subjectiveTemplate?.symptoms || template.commonSymptoms || prev.subjective.mainComplaints,
        painDescriptions: template.subjectiveTemplate?.painDescriptions || prev.subjective.painDescriptions,
        otherSymptoms: template.subjectiveTemplate?.otherSymptoms || prev.subjective.otherSymptoms
      },
      objective: chiropracticData?.objective ? {
        ...prev.objective,
        posture: chiropracticData.objective.posture || prev.objective.posture,
        gait: chiropracticData.objective.gait || prev.objective.gait,
        gaitOther: chiropracticData.objective.gaitOther || prev.objective.gaitOther,
        muscleTone: chiropracticData.objective.muscleTone || prev.objective.muscleTone,
        tenderness: chiropracticData.objective.tenderness || prev.objective.tenderness,
        spasm: chiropracticData.objective.spasm || prev.objective.spasm,
        swelling: chiropracticData.objective.swelling || prev.objective.swelling,
        vitalSigns: chiropracticData.objective.vitalSigns || prev.objective.vitalSigns,
        rangeOfMotion: chiropracticData.objective.rangeOfMotion || prev.objective.rangeOfMotion,
        orthopedicTests: chiropracticData.objective.orthopedicTests || prev.objective.orthopedicTests
      } : {
        ...prev.objective,
        systemExams: template.objectiveTemplate?.systemExams || prev.objective.systemExams,
        specialTests: template.objectiveTemplate?.specialTests || prev.objective.specialTests
      },
      assessment: {
        ...prev.assessment,
        diagnoses: template.template?.assessment?.differentialDiagnoses?.map((dx: string) => ({ diagnosis: dx, icd10: '', notes: '' })) || 
                  template.assessmentTemplate?.diagnoses || prev.assessment.diagnoses,
        clinicalImpression: template.template?.assessment?.clinicalImpression || 
                           template.assessmentTemplate?.clinicalImpression || prev.assessment.clinicalImpression
      },
      plan: {
        ...prev.plan,
        treatments: template.template?.plan?.treatments?.map((tx: string) => ({ treatment: tx, notes: '' })) || 
                   template.planTemplate?.treatments || prev.plan.treatments,
        medications: template.template?.plan?.medications?.map((med: string) => ({ medication: med, dosage: '', frequency: '', notes: '' })) || 
                    template.planTemplate?.medications || prev.plan.medications,
        followUpPeriod: template.template?.plan?.followUp?.[0] || template.planTemplate?.followUpPeriod || prev.plan.followUpPeriod,
        additionalInstructions: template.template?.plan?.patientEducation?.join('\n') || 
                               template.planTemplate?.additionalInstructions || prev.plan.additionalInstructions
      }
    }));
    
    toast({
      title: "Template Applied", 
      description: `${template.name} template has been applied to the form.`,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Overview
        return (
          <div className="space-y-6">
            <PatientProfileHeader 
              patient={getPatientDisplayData()} 
              isQuickNote={wizardData.isQuickNote}
              onToggleMode={() => setWizardData(prev => ({ ...prev, isQuickNote: !prev.isQuickNote }))}
            />
            
            <SmartTemplates 
              onApplyTemplate={applyTemplate}
              chiefComplaint={wizardData.chiefComplaint}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Visit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={wizardData.providerName}
                      onChange={(e) => setWizardData(prev => ({ ...prev, providerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date of Service</Label>
                    <Input
                      id="date"
                      type="date"
                      value={wizardData.dateCreated.toISOString().split('T')[0]}
                      onChange={(e) => setWizardData(prev => ({ 
                        ...prev, 
                        dateCreated: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="is-referral">Are you a referral?</Label>
                  <Switch
                    id="is-referral"
                    checked={wizardData.isReferral}
                    onCheckedChange={(checked) => setWizardData(prev => ({ ...prev, isReferral: checked }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="chief-complaint">Chief Complaint *</Label>
                  <Textarea
                    id="chief-complaint"
                    placeholder="Describe the main reason for today's visit..."
                    value={wizardData.chiefComplaint}
                    onChange={(e) => setWizardData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 1: // Subjective
        return (
          <SubjectiveSection
            data={wizardData.subjective}
            onChange={(data) => setWizardData(prev => ({ ...prev, subjective: data }))}
            specialty="chiropractic"
            patient={patient}
          />
        );
        
      case 2: // Objective
        return (
          <ObjectiveSection
            data={wizardData.objective}
            onChange={(data) => setWizardData(prev => ({ ...prev, objective: data }))}
            specialty="chiropractic"
          />
        );
        
      case 3: // Assessment
        return (
          <AssessmentSection
            data={wizardData.assessment}
            onChange={(data) => setWizardData(prev => ({ ...prev, assessment: data }))}
          />
        );
        
      case 4: // Plan
        return (
          <PlanSection
            data={wizardData.plan}
            onChange={(data) => setWizardData(prev => ({ ...prev, plan: data }))}
          />
        );
        
      default:
        return null;
    }
  };

  const currentStepInfo = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className={cn("max-w-7xl mx-auto",
        isMobile ? "px-4 py-4" : "px-6 py-8"
      )}>
        {/* Header */}
        <div className={cn("flex justify-between mb-6",
          isMobile ? "flex-col space-y-4" : "items-center mb-8"
        )}>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className={cn("hover:bg-primary/10",
                isMobile ? "mr-2" : "mr-4"
              )}
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
              Back
            </Button>
            <div>
              <div className={cn("flex space-x-2",
                isMobile ? "flex-col space-y-1 space-x-0" : "items-center space-x-3"
              )}>
                {!isMobile && (
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className={cn("font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
                    isMobile ? "text-lg" : "text-3xl"
                  )}>
                    SOAP Note Wizard
                  </h1>
                  <p className={cn("text-muted-foreground",
                    isMobile ? "text-sm" : "mt-1"
                  )}>
                    Patient: {wizardData.patientName}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={cn("flex space-x-3",
            isMobile ? "justify-between items-center" : "items-center space-x-4"
          )}>
            <Badge variant="outline" className={cn("bg-accent/20 border-accent",
              isMobile ? "text-xs" : ""
            )}>
              <Clock className={cn("mr-1", isMobile ? "w-2 h-2" : "w-3 h-3")} />
              Auto-saving
            </Badge>
            <div className="text-right">
              <div className={cn("text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Progress
              </div>
              <div className={cn("font-semibold",
                isMobile ? "text-sm" : "text-lg"
              )}>
                {calculateProgress()}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className={cn("mb-6", isMobile ? "" : "mb-8")}>
          <Progress value={calculateProgress()} className={cn(isMobile ? "h-1 mb-3" : "h-2 mb-4")} />
          
          <div className={cn("flex",
            isMobile ? "grid grid-cols-5 gap-1" : "justify-between"
          )}>
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completed.has(index) || isStepComplete(index);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn("flex flex-col items-center space-y-1 rounded-lg transition-all",
                    isMobile ? "p-1" : "space-y-2 p-3",
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : isCompleted 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className={cn("rounded-full flex items-center justify-center",
                    isMobile ? "w-6 h-6" : "w-10 h-10",
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className={cn(isMobile ? "w-3 h-3" : "w-5 h-5")} />
                    ) : (
                      <StepIcon className={cn(isMobile ? "w-3 h-3" : "w-5 h-5")} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={cn("font-medium",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {isMobile ? step.title.split(' ')[0] : step.title}
                    </div>
                    {!isMobile && (
                      <div className="text-xs text-muted-foreground hidden lg:block">
                        {step.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className={cn("gap-6",
          isMobile ? "flex flex-col" : "grid lg:grid-cols-4 gap-8"
        )}>
          {/* Main Content */}
          <div className={cn(isMobile ? "" : "lg:col-span-3")}>
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className={cn("bg-gradient-to-r from-primary/10 to-accent/10 border-b",
                isMobile ? "p-3" : ""
              )}>
                <CardTitle className={cn("flex items-center space-x-2",
                  isMobile ? "text-sm" : ""
                )}>
                  <currentStepInfo.icon className={cn("text-primary",
                    isMobile ? "w-4 h-4" : "w-5 h-5"
                  )} />
                  <span>{currentStepInfo.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={cn(isMobile ? "p-4" : "p-8")}>
                <ScrollArea className={cn(isMobile ? "h-[400px]" : "h-[600px]")}>
                  <div className={cn(isMobile ? "" : "pr-4")}>
                    {renderStepContent()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          {!isMobile && (
            <div className="space-y-6">
              <Card className="border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveNow}
                    className="w-full justify-start"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  
                  <Separator />
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium mb-2">Completion Status</div>
                    {STEPS.map((step, index) => (
                      <div key={step.id} className="flex items-center justify-between py-1">
                        <span className="text-xs">{step.title}</span>
                        {isStepComplete(index) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={cn("flex justify-between items-center mt-6 pt-4 border-t",
          isMobile ? "flex-col space-y-3" : "mt-8 pt-6"
        )}>
          {isMobile ? (
            <>
              <div className="flex w-full space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex-1"
                  size="sm"
                >
                  <ArrowLeft className="w-3 h-3 mr-2" />
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveNow}
                  className="px-3"
                >
                  <Save className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="w-full">
                {currentStep === STEPS.length - 1 ? (
                  <Button 
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
                    size="sm"
                  >
                    <Save className="w-3 h-3 mr-2" />
                    Save SOAP Note
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
                    size="sm"
                  >
                    Next
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {currentStep === STEPS.length - 1 ? (
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save SOAP Note
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}