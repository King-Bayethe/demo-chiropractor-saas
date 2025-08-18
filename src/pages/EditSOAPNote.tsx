import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Edit,
  ChevronDown,
  ChevronRight,
  SidebarClose,
  SidebarOpen
} from "lucide-react";

export default function EditSOAPNote() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [soapNote, setSOAPNote] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("subjective");
  
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
          {/* Sticky Header */}
          <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/soap-notes')} className="hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hover:bg-muted/50"
                  >
                    {sidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      SOAP Note - {getPatientName(patient)}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(soapNote.date_of_service)}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleEdit} size="sm" className="hover:bg-primary/10">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-muted/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Patient Sidebar */}
            <Collapsible
              open={sidebarOpen}
              onOpenChange={setSidebarOpen}
              className={`border-r border-border/50 bg-card/30 transition-all duration-300 ${
                sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
              }`}
            >
              <CollapsibleContent className="h-full">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {/* Patient Information */}
                    <Card className="border-2 border-primary/20">
                      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-3">
                        <CardTitle className="flex items-center text-lg">
                          <User className="w-5 h-5 mr-2 text-primary" />
                          Patient Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-primary">
                            {getPatientName(patient)}
                          </h3>
                          {patient && (
                            <div className="space-y-2 text-sm">
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
                                <span className="font-medium break-all">{patient.email || 'N/A'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Note Metadata */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                          <Calendar className="w-5 h-5 mr-2 text-primary" />
                          Note Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="font-medium">{soapNote.provider_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant={soapNote.is_draft ? "outline" : "default"} className="text-xs">
                              {soapNote.is_draft ? 'Quick Note' : 'Comprehensive'}
                            </Badge>
                          </div>
                          {soapNote.chief_complaint && (
                            <div className="pt-2 border-t">
                              <span className="text-muted-foreground">Chief Complaint:</span>
                              <p className="font-medium mt-1 text-xs leading-relaxed">{soapNote.chief_complaint}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vital Signs */}
                    {soapNote.vital_signs && Object.keys(soapNote.vital_signs).length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center text-lg">
                            <Activity className="w-5 h-5 mr-2 text-red-500" />
                            Vital Signs
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            {soapNote.vital_signs.height && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Height:</span>
                                <span className="font-medium">{soapNote.vital_signs.height}</span>
                              </div>
                            )}
                            {soapNote.vital_signs.weight && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Weight:</span>
                                <span className="font-medium">{soapNote.vital_signs.weight}</span>
                              </div>
                            )}
                            {soapNote.vital_signs.bloodPressure && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">BP:</span>
                                <span className="font-medium">{soapNote.vital_signs.bloodPressure}</span>
                              </div>
                            )}
                            {soapNote.vital_signs.heartRate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">HR:</span>
                                <span className="font-medium">{soapNote.vital_signs.heartRate}</span>
                              </div>
                            )}
                            {soapNote.vital_signs.temperature && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Temp:</span>
                                <span className="font-medium">{soapNote.vital_signs.temperature}</span>
                              </div>
                            )}
                            {soapNote.vital_signs.oxygenSaturation && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">SpO2:</span>
                                <span className="font-medium">{soapNote.vital_signs.oxygenSaturation}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            {/* Main Content Area */}
            <div className="flex-1 bg-background">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b border-border/50 bg-card/30 px-6 py-4">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                    <TabsTrigger value="subjective" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-300">
                      <User className="w-4 h-4 mr-2" />
                      Subjective
                    </TabsTrigger>
                    <TabsTrigger value="objective" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-950/50 dark:data-[state=active]:text-green-300">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Objective
                    </TabsTrigger>
                    <TabsTrigger value="assessment" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-950/50 dark:data-[state=active]:text-orange-300">
                      <Brain className="w-4 h-4 mr-2" />
                      Assessment
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-950/50 dark:data-[state=active]:text-purple-300">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Plan
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  {/* Subjective Tab */}
                  <TabsContent value="subjective" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        {soapNote.subjective_data ? (
                          <div className="space-y-6">
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                                Subjective Assessment
                              </h2>
                              <p className="text-muted-foreground">Patient's reported symptoms and concerns</p>
                            </div>

                            {soapNote.subjective_data.symptoms && soapNote.subjective_data.symptoms.length > 0 && (
                              <Card className="border-blue-200 dark:border-blue-800">
                                <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                                    Reported Symptoms
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="flex flex-wrap gap-2">
                                    {soapNote.subjective_data.symptoms.map((symptom: string, index: number) => (
                                      <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
                                        {symptom}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.subjective_data.painScale !== null && soapNote.subjective_data.painScale !== undefined && (
                              <Card className="border-red-200 dark:border-red-800">
                                <CardHeader className="bg-red-50 dark:bg-red-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <Heart className="w-5 h-5 mr-2 text-red-600" />
                                    Pain Assessment
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex space-x-1">
                                      {[...Array(10)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                            i < soapNote.subjective_data.painScale
                                              ? 'bg-red-500 border-red-500 text-white'
                                              : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                                          }`}
                                        >
                                          {i + 1}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                      {soapNote.subjective_data.painScale}/10
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Pain Scale: 0 = No pain, 10 = Worst possible pain
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.subjective_data.painDescription && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-primary" />
                                    Pain Description
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                                    {soapNote.subjective_data.painDescription}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.subjective_data.otherSymptoms && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <ClipboardList className="w-5 h-5 mr-2 text-primary" />
                                    Additional Symptoms
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border">
                                    {soapNote.subjective_data.otherSymptoms}
                                  </p>
                                </CardContent>
                              </Card>
                            )}

                            {(soapNote.subjective_data.isWithinNormalLimits || soapNote.subjective_data.isRefused) && (
                              <Card className="border-yellow-200 dark:border-yellow-800">
                                <CardHeader className="bg-yellow-50 dark:bg-yellow-950/30">
                                  <CardTitle className="text-lg">Assessment Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="space-y-2">
                                    {soapNote.subjective_data.isWithinNormalLimits && (
                                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                        Within Normal Limits
                                      </Badge>
                                    )}
                                    {soapNote.subjective_data.isRefused && (
                                      <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                                        Assessment Refused
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No subjective data available</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Objective Tab */}
                  <TabsContent value="objective" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        {soapNote.objective_data ? (
                          <div className="space-y-6">
                            <div className="border-l-4 border-green-500 pl-4">
                              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                                Objective Findings
                              </h2>
                              <p className="text-muted-foreground">Clinical observations and examination results</p>
                            </div>

                            {soapNote.objective_data.systemExams && soapNote.objective_data.systemExams.length > 0 && (
                              <Card className="border-green-200 dark:border-green-800">
                                <CardHeader className="bg-green-50 dark:bg-green-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                                    System Examinations
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="space-y-4">
                                    {soapNote.objective_data.systemExams.map((exam: any, index: number) => (
                                      <div key={index} className="border-l-4 border-green-400 bg-green-50/50 dark:bg-green-950/20 p-4 rounded-r-lg">
                                        <div className="font-semibold text-green-700 dark:text-green-300 mb-2">
                                          {exam.system}
                                        </div>
                                        <div className="text-sm text-muted-foreground leading-relaxed">
                                          {exam.findings}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.objective_data.specialTests && soapNote.objective_data.specialTests.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-primary" />
                                    Special Tests
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {soapNote.objective_data.specialTests.map((test: any, index: number) => (
                                      <div key={index} className="flex justify-between items-start bg-muted/30 p-4 rounded-lg border">
                                        <span className="font-medium">{test.test}</span>
                                        <span className="text-muted-foreground ml-4 text-right">{test.result}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.objective_data.imagingLabs && soapNote.objective_data.imagingLabs.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-primary" />
                                    Imaging & Labs
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {soapNote.objective_data.imagingLabs.map((item: any, index: number) => (
                                      <div key={index} className="border border-muted/50 p-4 rounded-lg bg-card/50">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium">{item.type}</span>
                                          <span className="text-sm text-muted-foreground">{item.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.results}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.objective_data.procedures && soapNote.objective_data.procedures.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <ClipboardList className="w-5 h-5 mr-2 text-primary" />
                                    Procedures
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {soapNote.objective_data.procedures.map((proc: any, index: number) => (
                                      <div key={index} className="border border-muted/50 p-4 rounded-lg bg-card/50">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium">{proc.procedure}</span>
                                          <span className="text-sm text-muted-foreground">{proc.date}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{proc.results}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No objective data available</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Assessment Tab */}
                  <TabsContent value="assessment" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        {soapNote.assessment_data ? (
                          <div className="space-y-6">
                            <div className="border-l-4 border-orange-500 pl-4">
                              <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                                Clinical Assessment
                              </h2>
                              <p className="text-muted-foreground">Provider's clinical interpretation and diagnosis</p>
                            </div>

                            {soapNote.assessment_data.diagnoses && soapNote.assessment_data.diagnoses.length > 0 && (
                              <Card className="border-orange-200 dark:border-orange-800">
                                <CardHeader className="bg-orange-50 dark:bg-orange-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <Brain className="w-5 h-5 mr-2 text-orange-600" />
                                    Diagnoses
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="space-y-4">
                                    {soapNote.assessment_data.diagnoses.map((diagnosis: any, index: number) => (
                                      <div key={index} className="border-l-4 border-orange-400 bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-r-lg">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-medium">{diagnosis.description}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {diagnosis.type}
                                          </Badge>
                                        </div>
                                        {diagnosis.code && (
                                          <div className="text-sm text-muted-foreground font-mono">
                                            Code: {diagnosis.code}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.assessment_data.clinicalImpression && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-primary" />
                                    Clinical Impression
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-muted/30 p-4 rounded-lg border">
                                    <p className="text-sm leading-relaxed">
                                      {soapNote.assessment_data.clinicalImpression}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No assessment data available</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Plan Tab */}
                  <TabsContent value="plan" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        {soapNote.plan_data ? (
                          <div className="space-y-6">
                            <div className="border-l-4 border-purple-500 pl-4">
                              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                                Treatment Plan
                              </h2>
                              <p className="text-muted-foreground">Treatment strategy and follow-up instructions</p>
                            </div>

                            {soapNote.plan_data.treatments && soapNote.plan_data.treatments.length > 0 && (
                              <Card className="border-purple-200 dark:border-purple-800">
                                <CardHeader className="bg-purple-50 dark:bg-purple-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                                    Treatments
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    {soapNote.plan_data.treatments.map((treatment: any, index: number) => (
                                      <div key={index} className="border border-muted/50 p-4 rounded-lg bg-purple-50/30 dark:bg-purple-950/20">
                                        <div className="font-medium mb-2">{treatment.type}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {treatment.frequency} • {treatment.provider}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.plan_data.medications && soapNote.plan_data.medications.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <Pill className="w-5 h-5 mr-2 text-primary" />
                                    Medications
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {soapNote.plan_data.medications.map((medication: any, index: number) => (
                                      <div key={index} className="border border-muted/50 p-4 rounded-lg bg-card/50">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <div className="font-medium flex items-center mb-1">
                                              <Pill className="w-4 h-4 mr-2 text-purple-600" />
                                              {medication.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {medication.dosage} • {medication.frequency}
                                            </div>
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {medication.duration}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.plan_data.additionalInstructions && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-primary" />
                                    Additional Instructions
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-muted/30 p-4 rounded-lg border">
                                    <p className="text-sm leading-relaxed">
                                      {soapNote.plan_data.additionalInstructions}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.plan_data.followUpInstructions && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                                    Follow-up Instructions
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-400">
                                    <p className="text-sm leading-relaxed">
                                      {soapNote.plan_data.followUpInstructions}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {soapNote.plan_data.legalTags && soapNote.plan_data.legalTags.length > 0 && (
                              <Card className="border-red-200 dark:border-red-800">
                                <CardHeader className="bg-red-50 dark:bg-red-950/30">
                                  <CardTitle className="text-lg flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                    Legal Tags
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                  <div className="flex flex-wrap gap-2">
                                    {soapNote.plan_data.legalTags.map((tag: string, index: number) => (
                                      <Badge key={index} variant="destructive">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No plan data available</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}