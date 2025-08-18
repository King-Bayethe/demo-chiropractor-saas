import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PatientProfileHeader } from "./PatientProfileHeader";
import { SubjectiveSection, SubjectiveData } from "./SubjectiveSection";
import { ObjectiveSection, ObjectiveData, VitalSigns, SystemExam, SpecialTest, ImagingLab, Procedure } from "./ObjectiveSection";
import { AssessmentSection, AssessmentData } from "./AssessmentSection";
import { PlanSection, PlanData } from "./PlanSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { SmartTemplates } from "./SmartTemplates";
import { ClinicalDecisionSupport } from "./ClinicalDecisionSupport";
import { EnhancedPainAssessment } from "./EnhancedPainAssessment";
import { EnhancedVitalSigns } from "./EnhancedVitalSigns";
import { ChevronDown, Save, FileText, Download, Clock, X, Zap, Brain, AlertCircle, RotateCcw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ComprehensiveSOAPFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: any;
  initialData?: Partial<SOAPFormData>;
  onSave: (data: SOAPFormData) => void;
}

export interface SOAPFormData {
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  dateCreated: Date;
  chiefComplaint: string;
  isQuickNote: boolean;
  subjective: SubjectiveData;
  objective: ObjectiveData;
  assessment: AssessmentData;
  plan: PlanData;
}

export function ComprehensiveSOAPForm({ 
  isOpen, 
  onClose, 
  patient, 
  initialData, 
  onSave 
}: ComprehensiveSOAPFormProps) {
  const { toast } = useToast();
  const [isQuickNote, setIsQuickNote] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const [openSections, setOpenSections] = useState<string[]>(["subjective"]);
  const [showAdvancedPain, setShowAdvancedPain] = useState(false);
  const [showClinicalSupport, setShowClinicalSupport] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState<any>(null);
  
  const [formData, setFormData] = useState<SOAPFormData>({
    patientId: patient?.id || "",
    patientName: patient?.name || "",
    providerId: "dr-silverman",
    providerName: "Dr. Silverman",
    dateCreated: new Date(),
    chiefComplaint: "",
    isQuickNote: false,
    subjective: {
      symptoms: [],
      painScale: null,
      painDescription: "",
      otherSymptoms: "",
      isRefused: false,
      isWithinNormalLimits: false
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
      procedures: []
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
  const draftKey = `soap_note_${patient?.id || 'new'}`;
  const { loadDraft, clearDraft, saveNow, hasDraft } = useAutoSave({
    key: draftKey,
    data: formData,
    interval: 30000, // 30 seconds
    enabled: isOpen
  });

  // Transform patient data for PatientProfileHeader
  const getPatientDisplayData = () => {
    if (!patient) {
      return {
        id: "new-patient",
        name: "New Patient",
        dateOfBirth: new Date().toISOString().split('T')[0],
        age: 0,
        gender: "Unknown",
        email: "",
        phone: "",
        address: "",
        medicalHistory: [],
        allergies: [],
        emergencyContact: undefined
      };
    }

    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient';
    const fullAddress = [patient.address, patient.city, patient.state, patient.zip_code]
      .filter(Boolean)
      .join(', ');

    const calculateAge = (dateOfBirth: string) => {
      if (!dateOfBirth) return 0;
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    return {
      id: patient.id,
      name: fullName,
      dateOfBirth: patient.date_of_birth || new Date().toISOString().split('T')[0],
      age: calculateAge(patient.date_of_birth || ''),
      gender: patient.gender || "Unknown",
      email: patient.email || "",
      phone: patient.phone || "",
      address: fullAddress || "",
      medicalHistory: patient.tags || [],
      allergies: [], // Could be extracted from tags or separate field
      emergencyContact: patient.emergency_contact_name && patient.emergency_contact_phone ? {
        name: patient.emergency_contact_name,
        phone: patient.emergency_contact_phone,
        relationship: "Emergency Contact"
      } : undefined
    };
  };

  // Check for existing draft when component opens
  useEffect(() => {
    if (isOpen && !initialData) {
      const draft = loadDraft();
      if (draft && draft.data) {
        const draftAge = new Date().getTime() - draft.timestamp.getTime();
        const hoursOld = draftAge / (1000 * 60 * 60);
        
        // Only show draft dialog if it's less than 24 hours old
        if (hoursOld < 24) {
          setDraftToRestore(draft);
          setShowDraftDialog(true);
        }
      }
    }
  }, [isOpen, initialData, loadDraft]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
    if (patient) {
      const patientName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 
                         patient.name || patient.email || 'Unknown Patient';
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patientName
      }));
    }
  }, [initialData, patient]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSave = () => {
    try {
      onSave(formData);
      // Clear draft after successful save
      clearDraft();
      toast({
        title: "SOAP Note Saved",
        description: `${formData.isQuickNote ? 'Quick note' : 'Comprehensive SOAP note'} saved successfully.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SOAP note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setFormData(draftToRestore.data);
      setShowDraftDialog(false);
      toast({
        title: "Draft Restored",
        description: "Your previous draft has been restored.",
      });
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
    toast({
      title: "Draft Discarded",
      description: "Previous draft has been discarded.",
    });
  };

  const exportToPDF = () => {
    const patientName = formData.patientName || 'Unknown Patient';
    
    try {
      import('../../services/pdfExport').then(({ exportSOAPFormDataToPDF }) => {
        exportSOAPFormDataToPDF(formData, patientName);
        toast({
          title: "PDF Export",
          description: "PDF exported successfully!",
        });
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 4;

    // Check subjective completion
    if ((formData.subjective?.symptoms?.length || 0) > 0 || formData.subjective?.painDescription || 
        formData.subjective?.isRefused || formData.subjective?.isWithinNormalLimits) {
      completed++;
    }

    // Check objective completion
    if (Object.values(formData.objective?.vitalSigns || {}).some(v => v) || 
        (formData.objective?.systemExams?.length || 0) > 0) {
      completed++;
    }

    // Check assessment completion
    if ((formData.assessment?.diagnoses?.length || 0) > 0 || formData.assessment?.clinicalImpression) {
      completed++;
    }

    // Check plan completion
    if ((formData.plan?.treatments?.length || 0) > 0 || (formData.plan?.medications?.length || 0) > 0 || 
        formData.plan?.additionalInstructions) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  };

  const getSectionsComplete = () => {
    return {
      subjective: (formData.subjective?.symptoms?.length || 0) > 0 || 
                 !!formData.subjective?.painDescription || 
                 formData.subjective?.isRefused || 
                 formData.subjective?.isWithinNormalLimits,
      objective: Object.values(formData.objective?.vitalSigns || {}).some(v => v) || 
                (formData.objective?.systemExams?.length || 0) > 0,
      assessment: (formData.assessment?.diagnoses?.length || 0) > 0 || 
                 formData.assessment?.clinicalImpression !== "",
      plan: (formData.plan?.treatments?.length || 0) > 0 || 
           (formData.plan?.medications?.length || 0) > 0 || 
           formData.plan?.additionalInstructions !== ""
    };
  };

  const applyTemplate = (template: any) => {
    // Auto-fill form fields from template
    setFormData(prev => ({
      ...prev,
      chiefComplaint: template.chiefComplaint || template.complaint || '',
      subjective: {
        ...prev.subjective,
        symptoms: template.subjectiveTemplate?.symptoms || template.commonSymptoms || [],
        painDescription: template.subjectiveTemplate?.painDescription || '',
        otherSymptoms: template.subjectiveTemplate?.otherSymptoms || ''
      },
      objective: {
        ...prev.objective,
        systemExams: template.objectiveTemplate?.systemExams || [],
        specialTests: template.objectiveTemplate?.specialTests || []
      },
      assessment: {
        ...prev.assessment,
        diagnoses: template.assessmentTemplate?.diagnoses || [],
        clinicalImpression: template.assessmentTemplate?.clinicalImpression || ''
      },
      plan: {
        ...prev.plan,
        treatments: template.planTemplate?.treatments || [],
        medications: template.planTemplate?.medications || [],
        followUpPeriod: template.planTemplate?.followUpPeriod || '',
        additionalInstructions: template.planTemplate?.additionalInstructions || ''
      }
    }));
    
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to the form.`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl max-h-[90vh] bg-background border border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                {isQuickNote ? 'Quick SOAP Note' : 'Comprehensive SOAP Assessment'}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-medical-blue-light text-medical-blue border-medical-blue">
                  <Brain className="w-3 h-3 mr-1" />
                  Smart Form
                </Badge>
                <Badge 
                  variant={getCompletionPercentage() === 100 ? "default" : "secondary"}
                  className={`text-xs ${getCompletionPercentage() === 100 ? 'bg-medical-green text-white' : ''}`}
                >
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasDraft() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDraftDialog(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Draft
                </Button>
              )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAdvancedPain(!showAdvancedPain)}
                  className={showAdvancedPain ? "bg-medical-blue-light border-medical-blue" : ""}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Advanced Pain
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowClinicalSupport(!showClinicalSupport)}
                  className={showClinicalSupport ? "bg-medical-green-light border-medical-green" : ""}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Clinical Support
                </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={saveNow}>
                <Clock className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <div className={`flex-1 ${showClinicalSupport ? 'w-2/3' : 'w-full'}`}>
              {isQuickNote ? (
                // Quick Note Mode - Collapsible Sections
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    <ProgressIndicator 
                      percentage={getCompletionPercentage()} 
                      sectionsComplete={getSectionsComplete()}
                    />
                    
                    <PatientProfileHeader 
                      patient={getPatientDisplayData()} 
                      isQuickNote={isQuickNote}
                      onToggleMode={() => setIsQuickNote(!isQuickNote)}
                    />
                    
                    <SmartTemplates 
                      onApplyTemplate={applyTemplate}
                      chiefComplaint={formData.chiefComplaint}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Chief Complaint</label>
                      <input
                        type="text"
                        value={formData.chiefComplaint}
                        onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                        placeholder="Brief description of main concern"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      />
                    </div>
                    
                    {/* Collapsible SOAP Sections */}
                    {[
                      { id: "subjective", title: "Subjective", component: SubjectiveSection },
                      { id: "objective", title: "Objective", component: ObjectiveSection },
                      { id: "assessment", title: "Assessment", component: AssessmentSection },
                      { id: "plan", title: "Plan", component: PlanSection }
                    ].map(({ id, title, component: Component }) => {
                      const isOpen = openSections.includes(id);
                      return (
                        <Collapsible key={id} open={isOpen} onOpenChange={() => toggleSection(id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-auto py-3">
                              <span className="font-medium">{title}</span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <Component
                              data={formData[id as keyof SOAPFormData] as any}
                              onChange={(data: any) => setFormData(prev => ({ ...prev, [id]: data }))}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                // Full Assessment Mode - Tabs
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="mx-6 mt-6 grid w-full grid-cols-5">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="subjective">Subjective</TabsTrigger>
                    <TabsTrigger value="objective">Objective</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="patient" className="h-full">
                      <ScrollArea className="h-full px-6 pb-6">
                        <div className="space-y-6">
                          <ProgressIndicator 
                            percentage={getCompletionPercentage()} 
                            sectionsComplete={getSectionsComplete()}
                          />
                          
                          <PatientProfileHeader 
                            patient={getPatientDisplayData()} 
                            isQuickNote={isQuickNote}
                            onToggleMode={() => setIsQuickNote(!isQuickNote)}
                          />
                          
                          <SmartTemplates 
                            onApplyTemplate={applyTemplate}
                            chiefComplaint={formData.chiefComplaint}
                          />
                        </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Visit Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Chief Complaint</label>
                            <input
                              type="text"
                              value={formData.chiefComplaint}
                              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                              placeholder="Brief description of main concern"
                              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Provider</label>
                              <input
                                type="text"
                                value={formData.providerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Date</label>
                              <input
                                type="datetime-local"
                                value={formData.dateCreated.toISOString().slice(0, 16)}
                                onChange={(e) => setFormData(prev => ({ ...prev, dateCreated: new Date(e.target.value) }))}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="subjective" className="h-full">
                    <ScrollArea className="h-full px-6 pb-6">
                      <div className="space-y-6">
                        {showAdvancedPain && (
                          <EnhancedPainAssessment
                            data={{
                              currentPain: formData.subjective.painScale || 0,
                              worstPain: 0,
                              averagePain: 0,
                              location: [],
                              quality: [],
                              triggers: [],
                              reliefFactors: [],
                              timePattern: "",
                              description: formData.subjective.painDescription || "",
                              functionalImpact: ""
                            }}
                            onChange={(painData) => {
                              setFormData(prev => ({
                                ...prev,
                                subjective: {
                                  ...prev.subjective,
                                  painScale: painData.currentPain,
                                  painDescription: painData.description
                                }
                              }));
                            }}
                          />
                        )}
                        
                        <SubjectiveSection
                          data={formData.subjective}
                          onChange={(data) => setFormData(prev => ({ ...prev, subjective: data }))}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="objective" className="h-full">
                    <ScrollArea className="h-full px-6 pb-6">
                      <div className="space-y-6">
                        <EnhancedVitalSigns
                          data={formData.objective.vitalSigns}
                          onChange={(vitalSigns) => setFormData(prev => ({
                            ...prev,
                            objective: {
                              ...prev.objective,
                              vitalSigns
                            }
                          }))}
                        />
                        
                        <ObjectiveSection
                          data={formData.objective}
                          onChange={(data) => setFormData(prev => ({ ...prev, objective: data }))}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="assessment" className="h-full">
                    <ScrollArea className="h-full px-6 pb-6">
                      <AssessmentSection
                        data={formData.assessment}
                        onChange={(data) => setFormData(prev => ({ ...prev, assessment: data }))}
                      />
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="plan" className="h-full">
                    <ScrollArea className="h-full px-6 pb-6">
                      <PlanSection
                        data={formData.plan}
                        onChange={(data) => setFormData(prev => ({ ...prev, plan: data }))}
                      />
                    </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              )}
            </div>

            {/* Clinical Decision Support Sidebar */}
            {showClinicalSupport && (
              <div className="w-1/3 border-l border-border">
                <ClinicalDecisionSupport 
                  formData={formData}
                  onSuggestionApply={(field, value) => {
                    // Handle suggestion application based on current context
                    toast({
                      title: "Suggestion Applied",
                      description: "AI suggestion has been applied to the form.",
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draft Recovery Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              Draft Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              We found a previous draft for this patient from{' '}
              {draftToRestore && (
                <span className="font-medium">
                  {new Date(draftToRestore.timestamp).toLocaleString()}
                </span>
              )}
              . Would you like to restore it or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}