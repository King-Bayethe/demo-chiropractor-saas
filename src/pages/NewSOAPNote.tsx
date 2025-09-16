import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
// AuthGuard removed for public portfolio
import { SOAPWizard } from "@/components/soap/SOAPWizard";
import { PatientSelector } from "@/components/PatientSelector";
import { EnhancedPatientContextHeader } from "@/components/soap/EnhancedPatientContextHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { UnifiedSOAPNote } from "@/types/soap";
import { ArrowLeft, UserPlus, Stethoscope, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function NewSOAPNote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  
  const { createSOAPNote } = useSOAPNotes();
  const { patients } = usePatients();
  
  const patientId = searchParams.get('patientId');

  // Load patient data if patientId is provided
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      
      setIsLoadingPatient(true);
      
      try {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          setSelectedPatient(patient);
          setShowWizard(true);
        } else {
          toast({
            title: "Patient not found",
            description: "The specified patient could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to load patient:', error);
        toast({
          title: "Error",
          description: "Failed to load patient data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPatient(false);
      }
    };

    if (patients.length > 0) {
      loadPatient();
    }
  }, [patientId, patients, toast]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowWizard(true);
  };

  const handleSave = async (data: UnifiedSOAPNote) => {
    try {
      if (!selectedPatient?.id) {
        toast({
          title: "Error",
          description: "Please select a patient first.",
          variant: "destructive",
        });
        return;
      }

      console.log('NewSOAPNote handleSave - Unified SOAP data received:', data);
      console.log('NewSOAPNote handleSave - Data type and keys:', typeof data, Object.keys(data || {}));
      console.log('NewSOAPNote handleSave - Data content preview:', JSON.stringify(data).substring(0, 200) + '...');

      // Data is already in the correct unified format from SOAPWizard
      const result = await createSOAPNote(data);

      if (result) {
        toast({
          title: "SOAP Note Created",
          description: `SOAP note for ${getPatientName(selectedPatient)} has been created successfully.`,
        });
        navigate('/soap-notes');
      }
    } catch (error) {
      console.error('Failed to save SOAP note:', error);
      toast({
        title: "Error",
        description: "Failed to create SOAP note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (showWizard) {
      setShowWizard(false);
      setSelectedPatient(null);
    } else {
      navigate('/soap-notes');
    }
  };

  const getPatientName = (patient: any): string => {
    if (!patient) return 'Unknown Patient';
    
    const firstName = patient.first_name || patient.firstNameLowerCase || '';
    const lastName = patient.last_name || patient.lastNameLowerCase || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || patient.email || 'Unknown Patient';
  };

  // Show loading state
  if (isLoadingPatient) {
    return (
      <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading patient data...</p>
            </div>
          </div>
        </Layout>
    );
  }

  // Show wizard if patient is selected
  if (showWizard && selectedPatient) {
    return (
      <Layout>
          <div className={cn("max-w-6xl mx-auto",
            isMobile ? "px-4 py-4" : "px-6 py-8"
          )}>
            {selectedPatient && <EnhancedPatientContextHeader patient={selectedPatient} />}
            <SOAPWizard
              patient={selectedPatient}
              onSave={handleSave}
              onBack={handleBack}
            />
          </div>
        </Layout>
    );
  }

  // Show patient selection
  return (
    <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className={cn("max-w-4xl mx-auto",
            isMobile ? "px-4 py-6" : "px-6 py-8"
          )}>
            {/* Header */}
            <div className={cn("flex mb-6",
              isMobile ? "flex-col space-y-4" : "items-center mb-8"
            )}>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/soap-notes')} 
                className={cn("hover:bg-primary/10",
                  isMobile ? "self-start" : "mr-4"
                )}
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                {isMobile ? "Back" : "Back to SOAP Notes"}
              </Button>
              
              <div className="flex-1">
                <div className={cn("flex space-x-3",
                  isMobile ? "flex-col space-y-2 space-x-0" : "items-center"
                )}>
                  <div className={cn("p-2 bg-primary/10 rounded-lg",
                    isMobile ? "self-start" : ""
                  )}>
                    <Stethoscope className={cn("text-primary",
                      isMobile ? "w-5 h-5" : "w-6 h-6"
                    )} />
                  </div>
                  <div>
                    <h1 className={cn("font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
                      isMobile ? "text-xl" : "text-3xl"
                    )}>
                      Create New SOAP Note
                    </h1>
                    <p className={cn("text-muted-foreground",
                      isMobile ? "text-sm mt-1" : "mt-1"
                    )}>
                      {isMobile ? "Select a patient to continue" : "Start by selecting a patient to continue with the assessment"}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isMobile && (
                <Badge variant="outline" className="bg-accent/20 border-accent text-accent-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Smart Wizard
                </Badge>
              )}
            </div>

            {/* Patient Selection Card */}
            <Card className={cn("max-w-2xl mx-auto shadow-lg border-0 bg-card/50 backdrop-blur-sm",
              isMobile ? "" : ""
            )}>
              <CardHeader className={cn("bg-gradient-to-r from-primary/10 to-accent/10 border-b",
                isMobile ? "p-4" : ""
              )}>
                <CardTitle className={cn("flex items-center space-x-2",
                  isMobile ? "text-base" : ""
                )}>
                  <UserPlus className={cn("text-primary",
                    isMobile ? "w-4 h-4" : "w-5 h-5"
                  )} />
                  <span>Select Patient</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={cn(isMobile ? "p-4" : "p-8")}>
                <div className={cn("space-y-4", isMobile ? "" : "space-y-6")}>
                  <div className="text-center mb-4">
                    <div className={cn("bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3",
                      isMobile ? "w-12 h-12" : "w-16 h-16 mb-4"
                    )}>
                      <UserPlus className={cn("text-primary",
                        isMobile ? "w-6 h-6" : "w-8 h-8"
                      )} />
                    </div>
                    <h3 className={cn("font-semibold mb-2",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      Choose Your Patient
                    </h3>
                    <p className={cn("text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {isMobile ? "Search and select the patient" : "Search and select the patient for whom you want to create a SOAP note"}
                    </p>
                  </div>

                  <PatientSelector
                    selectedPatient={selectedPatient}
                    onPatientSelect={setSelectedPatient}
                  />

                  <div className={cn("flex pt-4 border-t",
                    isMobile ? "flex-col space-y-2" : "justify-between pt-6"
                  )}>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/soap-notes')}
                      className={cn("hover:bg-muted",
                        isMobile ? "w-full" : ""
                      )}
                      size={isMobile ? "sm" : "default"}
                    >
                      Cancel
                    </Button>
                    <Button 
                      disabled={!selectedPatient}
                      onClick={() => handlePatientSelect(selectedPatient)}
                      className={cn("bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg",
                        isMobile ? "w-full" : ""
                      )}
                      size={isMobile ? "sm" : "default"}
                    >
                      {isMobile ? "Continue" : `Continue with ${selectedPatient ? getPatientName(selectedPatient) : 'Selected Patient'}`}
                      <ArrowLeft className={cn("ml-2 rotate-180",
                        isMobile ? "w-3 h-3" : "w-4 h-4"
                      )} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            {!isMobile && (
              <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered templates that adapt to patient conditions
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Guided Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step wizard for comprehensive evaluations
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Auto-Save</h3>
                    <p className="text-sm text-muted-foreground">
                      Never lose your work with automatic draft saving
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Layout>
  );
}