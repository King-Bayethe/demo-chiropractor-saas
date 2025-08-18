import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Thermometer, 
  Activity,
  ClipboardList,
  Stethoscope,
  Brain,
  Pill,
  AlertTriangle,
  Save,
  Download,
  Edit
} from "lucide-react";

export default function EditSOAPNote() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [soapNote, setSOAPNote] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const { getSOAPNote, updateSOAPNote } = useSOAPNotes();
  const { patients } = usePatients();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const note = await getSOAPNote(id);
        
        if (note) {
          setSOAPNote(note);
          
          // Find patient data
          const patientData = patients.find(p => p.id === note.patient_id) || note.patients;
          setPatient(patientData);
        } else {
          toast({
            title: "Error",
            description: "SOAP note not found.",
            variant: "destructive",
          });
          navigate('/soap-notes');
        }
      } catch (error) {
        console.error('Failed to load SOAP note:', error);
        toast({
          title: "Error",
          description: "Failed to load SOAP note.",
          variant: "destructive",
        });
        navigate('/soap-notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, patients]);

  const handleEdit = () => {
    navigate(`/soap-notes/edit/${id}`);
  };

  const getPatientName = (patient: any): string => {
    if (!patient) return 'Unknown Patient';
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    return `${firstName} ${lastName}`.trim() || patient.email || 'Unknown Patient';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading SOAP note...</p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!soapNote) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">SOAP Note Not Found</h1>
              <Button onClick={() => navigate('/soap-notes')}>
                Return to SOAP Notes
              </Button>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header */}
          <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/soap-notes')} className="hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to SOAP Notes
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      SOAP Note Details
                    </h1>
                    <p className="text-muted-foreground">
                      Comprehensive view of patient assessment and plan
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleEdit} className="hover:bg-primary/10">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Note
                  </Button>
                  <Button variant="outline" className="hover:bg-muted/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Patient Info & Vital Signs */}
                <div className="space-y-6">
                  
                  {/* Patient Information */}
                  <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-primary" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-primary">
                          {getPatientName(patient)}
                        </h3>
                        {patient && (
                          <div className="space-y-2 mt-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">DOB:</span>
                              <span className="font-medium">{patient.date_of_birth || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gender:</span>
                              <span className="font-medium">{patient.gender || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{patient.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium text-xs">{patient.email || 'N/A'}</span>
                            </div>
                            {patient.tags && patient.tags.length > 0 && (
                              <div className="pt-2">
                                <span className="text-muted-foreground text-xs">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.tags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Note Metadata */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-primary" />
                        Note Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium">{soapNote.provider_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{formatDate(soapNote.date_of_service)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant={soapNote.is_draft ? "outline" : "default"}>
                          {soapNote.is_draft ? 'Quick Note' : 'Comprehensive'}
                        </Badge>
                      </div>
                      {soapNote.chief_complaint && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground text-sm">Chief Complaint:</span>
                          <p className="font-medium mt-1">{soapNote.chief_complaint}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  {soapNote.vital_signs && Object.keys(soapNote.vital_signs).length > 0 && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-red-500" />
                          Vital Signs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {soapNote.vital_signs.height && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-muted-foreground">Height:</span>
                              <span className="font-medium">{soapNote.vital_signs.height}</span>
                            </div>
                          )}
                          {soapNote.vital_signs.weight && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="font-medium">{soapNote.vital_signs.weight}</span>
                            </div>
                          )}
                          {soapNote.vital_signs.bloodPressure && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-muted-foreground">BP:</span>
                              <span className="font-medium">{soapNote.vital_signs.bloodPressure}</span>
                            </div>
                          )}
                          {soapNote.vital_signs.heartRate && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span className="text-muted-foreground">HR:</span>
                              <span className="font-medium">{soapNote.vital_signs.heartRate}</span>
                            </div>
                          )}
                          {soapNote.vital_signs.temperature && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-muted-foreground">Temp:</span>
                              <span className="font-medium">{soapNote.vital_signs.temperature}</span>
                            </div>
                          )}
                          {soapNote.vital_signs.oxygenSaturation && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                              <span className="text-muted-foreground">SpO2:</span>
                              <span className="font-medium">{soapNote.vital_signs.oxygenSaturation}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Middle Column - SOAP Sections */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Subjective */}
                  {soapNote.subjective_data && (
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                        <CardTitle className="flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Subjective
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {soapNote.subjective_data.symptoms && soapNote.subjective_data.symptoms.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">SYMPTOMS</h4>
                            <div className="flex flex-wrap gap-2">
                              {soapNote.subjective_data.symptoms.map((symptom: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.subjective_data.painScale && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">PAIN SCALE</h4>
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full ${
                                      i < soapNote.subjective_data.painScale
                                        ? 'bg-red-500'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold text-lg text-red-600">
                                {soapNote.subjective_data.painScale}/10
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {soapNote.subjective_data.painDescription && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">PAIN DESCRIPTION</h4>
                            <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                              {soapNote.subjective_data.painDescription}
                            </p>
                          </div>
                        )}
                        
                        {soapNote.subjective_data.otherSymptoms && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">OTHER SYMPTOMS</h4>
                            <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                              {soapNote.subjective_data.otherSymptoms}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Objective */}
                  {soapNote.objective_data && (
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                        <CardTitle className="flex items-center">
                          <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                          Objective
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {soapNote.objective_data.systemExams && soapNote.objective_data.systemExams.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">SYSTEM EXAMINATIONS</h4>
                            <div className="space-y-3">
                              {soapNote.objective_data.systemExams.map((exam: any, index: number) => (
                                <div key={index} className="border-l-4 border-green-400 bg-green-50/50 dark:bg-green-950/20 p-3 rounded-r-lg">
                                  <div className="font-medium text-green-700 dark:text-green-300 text-sm">
                                    {exam.system}
                                  </div>
                                  <div className="text-sm mt-1 text-muted-foreground">
                                    {exam.findings}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.objective_data.specialTests && soapNote.objective_data.specialTests.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">SPECIAL TESTS</h4>
                            <div className="space-y-2">
                              {soapNote.objective_data.specialTests.map((test: any, index: number) => (
                                <div key={index} className="flex justify-between items-start bg-muted/30 p-3 rounded-lg">
                                  <span className="font-medium text-sm">{test.test}</span>
                                  <span className="text-sm text-muted-foreground ml-4">{test.result}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.objective_data.imagingLabs && soapNote.objective_data.imagingLabs.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">IMAGING & LABS</h4>
                            <div className="space-y-3">
                              {soapNote.objective_data.imagingLabs.map((item: any, index: number) => (
                                <div key={index} className="border border-muted/50 p-3 rounded-lg bg-card/50">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm">{item.type}</span>
                                    <span className="text-xs text-muted-foreground">{item.date}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{item.results}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.objective_data.procedures && soapNote.objective_data.procedures.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">PROCEDURES</h4>
                            <div className="space-y-3">
                              {soapNote.objective_data.procedures.map((proc: any, index: number) => (
                                <div key={index} className="border border-muted/50 p-3 rounded-lg bg-card/50">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm">{proc.procedure}</span>
                                    <span className="text-xs text-muted-foreground">{proc.date}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{proc.results}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Assessment */}
                  {soapNote.assessment_data && (
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                        <CardTitle className="flex items-center">
                          <Brain className="w-5 h-5 mr-2 text-orange-600" />
                          Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {soapNote.assessment_data.diagnoses && soapNote.assessment_data.diagnoses.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">DIAGNOSES</h4>
                            <div className="space-y-3">
                              {soapNote.assessment_data.diagnoses.map((diagnosis: any, index: number) => (
                                <div key={index} className="border-l-4 border-orange-400 bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-r-lg">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm">{diagnosis.description}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {diagnosis.type}
                                    </Badge>
                                  </div>
                                  {diagnosis.code && (
                                    <div className="text-xs text-muted-foreground font-mono">
                                      Code: {diagnosis.code}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.assessment_data.clinicalImpression && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">CLINICAL IMPRESSION</h4>
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed">
                                {soapNote.assessment_data.clinicalImpression}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Plan */}
                  {soapNote.plan_data && (
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                        <CardTitle className="flex items-center">
                          <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                          Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {soapNote.plan_data.treatments && soapNote.plan_data.treatments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">TREATMENTS</h4>
                            <div className="space-y-3">
                              {soapNote.plan_data.treatments.map((treatment: any, index: number) => (
                                <div key={index} className="border border-muted/50 p-3 rounded-lg bg-purple-50/30 dark:bg-purple-950/20">
                                  <div className="font-medium text-sm mb-1">{treatment.type}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {treatment.frequency} • {treatment.provider}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.plan_data.medications && soapNote.plan_data.medications.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-3">MEDICATIONS</h4>
                            <div className="space-y-3">
                              {soapNote.plan_data.medications.map((medication: any, index: number) => (
                                <div key={index} className="border border-muted/50 p-3 rounded-lg bg-card/50">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="font-medium text-sm flex items-center">
                                        <Pill className="w-3 h-3 mr-1 text-purple-600" />
                                        {medication.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {medication.dosage} • {medication.frequency}
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {medication.duration}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {soapNote.plan_data.additionalInstructions && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">ADDITIONAL INSTRUCTIONS</h4>
                            <div className="bg-muted/30 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed">
                                {soapNote.plan_data.additionalInstructions}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {soapNote.plan_data.followUpInstructions && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">FOLLOW-UP INSTRUCTIONS</h4>
                            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-400">
                              <p className="text-sm leading-relaxed">
                                {soapNote.plan_data.followUpInstructions}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {soapNote.plan_data.legalTags && soapNote.plan_data.legalTags.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">LEGAL TAGS</h4>
                            <div className="flex flex-wrap gap-2">
                              {soapNote.plan_data.legalTags.map((tag: string, index: number) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}