import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientProfileHeader } from "./PatientProfileHeader";
import { SubjectiveSection, SubjectiveData } from "./SubjectiveSection";
import { ObjectiveSection, ObjectiveData } from "./ObjectiveSection";
import { AssessmentSection, AssessmentData } from "./AssessmentSection";
import { PlanSection, PlanData } from "./PlanSection";
import { SmartTemplates } from "./SmartTemplates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  X, 
  Clock, 
  Sparkles, 
  Download, 
  Clipboard, 
  Stethoscope, 
  Target, 
  Calendar,
  CheckCircle
} from "lucide-react";

interface SOAPEditorProps {
  patient: any;
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

interface FormData {
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

export function SOAPEditor({ patient, initialData, onSave, onCancel }: SOAPEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const [formData, setFormData] = useState<FormData>(initialData);

  // Auto-save functionality
  const draftKey = `soap_editor_${patient?.id}`;
  const { saveNow, hasDraft, clearDraft } = useAutoSave({
    key: draftKey,
    data: formData,
    interval: 30000,
    enabled: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const getPatientDisplayData = () => {
    return patient;
  };

  const handleSave = () => {
    onSave(formData);
    clearDraft();
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

  const applyTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      chiefComplaint: template.chiefComplaint || template.complaint || prev.chiefComplaint,
      subjective: {
        ...prev.subjective,
        symptoms: template.subjectiveTemplate?.symptoms || template.commonSymptoms || prev.subjective.symptoms,
        painDescription: template.subjectiveTemplate?.painDescription || prev.subjective.painDescription,
        otherSymptoms: template.subjectiveTemplate?.otherSymptoms || prev.subjective.otherSymptoms
      },
      objective: {
        ...prev.objective,
        systemExams: template.objectiveTemplate?.systemExams || prev.objective.systemExams,
        specialTests: template.objectiveTemplate?.specialTests || prev.objective.specialTests
      },
      assessment: {
        ...prev.assessment,
        diagnoses: template.assessmentTemplate?.diagnoses || prev.assessment.diagnoses,
        clinicalImpression: template.assessmentTemplate?.clinicalImpression || prev.assessment.clinicalImpression
      },
      plan: {
        ...prev.plan,
        treatments: template.planTemplate?.treatments || prev.plan.treatments,
        medications: template.planTemplate?.medications || prev.plan.medications,
        followUpPeriod: template.planTemplate?.followUpPeriod || prev.plan.followUpPeriod,
        additionalInstructions: template.planTemplate?.additionalInstructions || prev.plan.additionalInstructions
      }
    }));
    
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to the form.`,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <PatientProfileHeader 
              patient={getPatientDisplayData()} 
              isQuickNote={formData.isQuickNote}
              onToggleMode={() => setFormData(prev => ({ ...prev, isQuickNote: !prev.isQuickNote }))}
            />
            
            <SmartTemplates 
              onApplyTemplate={applyTemplate}
              chiefComplaint={formData.chiefComplaint}
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
                      value={formData.providerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date of Service</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.dateCreated.toISOString().split('T')[0]}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dateCreated: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="chief-complaint">Chief Complaint *</Label>
                  <Textarea
                    id="chief-complaint"
                    placeholder="Describe the main reason for today's visit..."
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case "subjective":
        return (
          <SubjectiveSection
            data={formData.subjective}
            onChange={(data) => setFormData(prev => ({ ...prev, subjective: data }))}
          />
        );
        
      case "objective":
        return (
          <ObjectiveSection
            data={formData.objective}
            onChange={(data) => setFormData(prev => ({ ...prev, objective: data }))}
          />
        );
        
      case "assessment":
        return (
          <AssessmentSection
            data={formData.assessment}
            onChange={(data) => setFormData(prev => ({ ...prev, assessment: data }))}
          />
        );
        
      case "plan":
        return (
          <PlanSection
            data={formData.plan}
            onChange={(data) => setFormData(prev => ({ ...prev, plan: data }))}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                {formData.isQuickNote ? 'Quick SOAP Note' : 'Comprehensive SOAP Assessment'}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart Form
                </Badge>
                <Badge 
                  variant={getCompletionPercentage() === 100 ? "default" : "secondary"}
                  className={`text-xs ${getCompletionPercentage() === 100 ? 'bg-green-500 text-white' : ''}`}
                >
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToPDF}
                className="hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveNow}
                className="hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCancel}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Clipboard className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjective" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
            <Clipboard className="w-4 h-4 mr-2" />
            Subjective
          </TabsTrigger>
          <TabsTrigger value="objective" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
            <Stethoscope className="w-4 h-4 mr-2" />
            Objective
          </TabsTrigger>
          <TabsTrigger value="assessment" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
            <Target className="w-4 h-4 mr-2" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
            <Calendar className="w-4 h-4 mr-2" />
            Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <ScrollArea className="h-[600px]">
                <div className="pr-4">
                  {renderTabContent()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center space-x-4">
          {hasDraft() && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />
              Draft saved
            </Badge>
          )}
          <div className="text-sm text-muted-foreground">
            Completion: {getCompletionPercentage()}%
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save SOAP Note
          </Button>
        </div>
      </div>
    </div>
  );
}