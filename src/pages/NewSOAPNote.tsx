import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { SOAPWizard } from "@/components/soap/SOAPWizard";
import { PatientSelector } from "@/components/PatientSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { UnifiedSOAPNote } from "@/types/soap";
import { ArrowLeft, UserPlus, Stethoscope, Sparkles } from "lucide-react";

export default function NewSOAPNote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
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
      <AuthGuard>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading patient data...</p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  // Show wizard if patient is selected
  if (showWizard && selectedPatient) {
    return (
      <AuthGuard>
        <Layout>
          <SOAPWizard
            patient={selectedPatient}
            onSave={handleSave}
            onBack={handleBack}
          />
        </Layout>
      </AuthGuard>
    );
  }

  // Show patient selection
  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/soap-notes')} 
                className="mr-4 hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to SOAP Notes
              </Button>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Create New SOAP Note
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Start by selecting a patient to continue with the assessment
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-accent/20 border-accent text-accent-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart Wizard
              </Badge>
            </div>

            {/* Patient Selection Card */}
            <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <span>Select Patient</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Choose Your Patient</h3>
                    <p className="text-muted-foreground text-sm">
                      Search and select the patient for whom you want to create a SOAP note
                    </p>
                  </div>

                  <PatientSelector
                    selectedPatient={selectedPatient}
                    onPatientSelect={setSelectedPatient}
                  />

                  <div className="flex justify-between pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/soap-notes')}
                      className="hover:bg-muted"
                    >
                      Cancel
                    </Button>
                    <Button 
                      disabled={!selectedPatient}
                      onClick={() => handlePatientSelect(selectedPatient)}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
                    >
                      Continue with {selectedPatient ? getPatientName(selectedPatient) : 'Selected Patient'}
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
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
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}