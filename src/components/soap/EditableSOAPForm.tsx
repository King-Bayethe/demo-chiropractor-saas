import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { ComprehensiveSOAPForm } from "./ComprehensiveSOAPForm";
import { SOAPFormData } from "@/types/soap";
import { SOAPDataConverter, UnifiedSOAPNote } from "@/types/soap";
import { ArrowLeft, Save } from "lucide-react";

export default function EditableSOAPForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [soapNote, setSOAPNote] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const handleSave = async (formData: any) => {
    if (!id) return;

    try {
      console.log('EditableSOAPForm handleSave - Original form data:', formData);
      
      // Convert form data to unified format using any to bypass type conflicts temporarily
      const updateData = SOAPDataConverter.formToUnified(formData as any);
      
      console.log('EditableSOAPForm handleSave - Converted update data:', updateData);
      
      const updatedNote = await updateSOAPNote(id, updateData);
      
      if (updatedNote) {
        toast({
          title: "Success",
          description: "SOAP note updated successfully.",
        });
        navigate('/soap-notes');
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating SOAP note:', error);
      toast({
        title: "Error",
        description: "Failed to update SOAP note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertToFormData = (soapNote: any): any => {
    if (!soapNote) {
      return SOAPDataConverter.unifiedToForm({
        patient_id: patient?.id || "",
        provider_name: "Dr. Silverman",
        date_of_service: new Date(),
        chief_complaint: "",
        is_draft: false,
        subjective_data: SOAPDataConverter.getDefaultSubjective(),
        objective_data: SOAPDataConverter.getDefaultObjective(),
        assessment_data: SOAPDataConverter.getDefaultAssessment(),
        plan_data: SOAPDataConverter.getDefaultPlan()
      }, getPatientName(patient));
    }

    return SOAPDataConverter.unifiedToForm(soapNote, getPatientName(patient));
  };

  const getPatientName = (patient: any): string => {
    if (!patient) return 'Unknown Patient';
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    return `${firstName} ${lastName}`.trim() || patient.email || 'Unknown Patient';
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
          <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/soap-notes')} className="hover:bg-muted/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to SOAP Notes
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Edit SOAP Note - {getPatientName(patient)}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(soapNote.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <ComprehensiveSOAPForm
            isOpen={true}
            onClose={() => navigate('/soap-notes')}
            patient={patient}
            initialData={convertToFormData(soapNote)}
            onSave={handleSave}
            isPageMode={true}
          />
        </div>
      </Layout>
    </AuthGuard>
  );
}