import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { ComprehensiveSOAPForm, SOAPFormData } from "@/components/soap/ComprehensiveSOAPForm";
import { PatientSelector } from "@/components/PatientSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { ArrowLeft } from "lucide-react";

export default function CreateSOAPNote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams();
  const { toast } = useToast();
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [initialData, setInitialData] = useState<SOAPFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createSOAPNote, updateSOAPNote, getSOAPNote } = useSOAPNotes();
  const { patients } = usePatients();

  const isEditMode = !!editId;
  const patientId = searchParams.get('patientId');

  // Load patient and note data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // If editing, load the existing note
        if (isEditMode && editId) {
          const note = await getSOAPNote(editId);
          if (note) {
            // Find the patient for this note
            const patient = patients.find(p => p.id === note.patient_id);
            if (patient) {
              setSelectedPatient(patient);
            }
            
            // Convert note data to form format
            const patientName = getPatientName(patient);
            setInitialData({
              patientId: note.patient_id,
              patientName: patientName,
              providerId: "dr-silverman",
              providerName: note.provider_name,
              dateCreated: new Date(note.date_of_service),
              chiefComplaint: note.chief_complaint,
              isQuickNote: note.is_draft,
              subjective: note.subjective_data || {},
              objective: note.objective_data || { vitalSigns: note.vital_signs || {} },
              assessment: note.assessment_data || {},
              plan: note.plan_data || {}
            });
          }
        }
        // If creating with a specific patient
        else if (patientId) {
          const patient = patients.find(p => p.id === patientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (patients.length > 0) {
      loadData();
    }
  }, [editId, patientId, patients, getSOAPNote, isEditMode, toast]);

  const handleSave = async (data: SOAPFormData) => {
    try {
      if (!selectedPatient) {
        toast({
          title: "Error",
          description: "Please select a patient first.",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode && editId) {
        // Update existing note
        const result = await updateSOAPNote(editId, {
          provider_name: data.providerName,
          date_of_service: data.dateCreated,
          chief_complaint: data.chiefComplaint,
          is_draft: data.isQuickNote,
          subjective_data: data.subjective,
          objective_data: data.objective,
          assessment_data: data.assessment,
          plan_data: data.plan,
          vital_signs: data.objective.vitalSigns
        });

        if (result) {
          toast({
            title: "SOAP Note Updated",
            description: "SOAP note has been updated successfully.",
          });
          navigate('/soap-notes');
        }
      } else {
        // Create new note
        const result = await createSOAPNote({
          patient_id: selectedPatient.id,
          provider_name: data.providerName,
          date_of_service: data.dateCreated,
          chief_complaint: data.chiefComplaint,
          is_draft: data.isQuickNote,
          subjective_data: data.subjective,
          objective_data: data.objective,
          assessment_data: data.assessment,
          plan_data: data.plan,
          vital_signs: data.objective.vitalSigns
        });

        if (result) {
          toast({
            title: "SOAP Note Created",
            description: `SOAP note for ${getPatientName(selectedPatient)} has been created successfully.`,
          });
          navigate('/soap-notes');
        }
      }
    } catch (error) {
      console.error('Failed to save SOAP note:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} SOAP note. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    navigate('/soap-notes');
  };

  // Helper function to safely get patient name
  const getPatientName = (patient: any): string => {
    if (!patient) return 'Unknown Patient';
    
    const firstName = patient.first_name || patient.firstNameLowerCase || '';
    const lastName = patient.last_name || patient.lastNameLowerCase || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || patient.email || 'Unknown Patient';
  };

  // Show patient selection if no patient is selected and not in edit mode
  if (!selectedPatient && !isEditMode && !isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={() => navigate('/soap-notes')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to SOAP Notes
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New SOAP Note</h1>
                <p className="text-muted-foreground">Select a patient to continue</p>
              </div>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PatientSelector
                  selectedPatient={selectedPatient}
                  onPatientSelect={setSelectedPatient}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => navigate('/soap-notes')}>
                    Cancel
                  </Button>
                  <Button disabled={!selectedPatient}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-border/50">
            <div className="flex items-center mb-4">
              <Button variant="ghost" onClick={() => navigate('/soap-notes')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to SOAP Notes
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? 'Edit SOAP Note' : 'Create New SOAP Note'}
                </h1>
                {selectedPatient && (
                  <p className="text-muted-foreground">
                    Patient: {getPatientName(selectedPatient)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ComprehensiveSOAPForm
              isOpen={true}
              onClose={handleClose}
              patient={selectedPatient}
              initialData={initialData}
              onSave={handleSave}
              isPageMode={true}
            />
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}