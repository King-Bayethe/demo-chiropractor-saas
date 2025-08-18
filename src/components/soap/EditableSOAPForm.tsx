import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { ComprehensiveSOAPForm, SOAPFormData } from "./ComprehensiveSOAPForm";
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

  const handleSave = async (formData: SOAPFormData) => {
    if (!id) return;

    try {
      const updateData = {
        patient_id: formData.patientId,
        provider_name: formData.providerName,
        date_of_service: formData.dateCreated,
        chief_complaint: formData.chiefComplaint,
        is_draft: formData.isQuickNote,
        subjective_data: formData.subjective,
        objective_data: formData.objective,
        assessment_data: formData.assessment,
        plan_data: formData.plan,
        vital_signs: formData.objective?.vitalSigns
      };

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

  const convertToFormData = (soapNote: any): SOAPFormData => {
    if (!soapNote) {
      return {
        patientId: patient?.id || "",
        patientName: getPatientName(patient),
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
      };
    }

    return {
      patientId: soapNote.patient_id || "",
      patientName: getPatientName(patient),
      providerId: soapNote.provider_id || "dr-silverman",
      providerName: soapNote.provider_name || "Dr. Silverman",
      dateCreated: new Date(soapNote.date_of_service || soapNote.created_at),
      chiefComplaint: soapNote.chief_complaint || "",
      isQuickNote: soapNote.is_draft || false,
      subjective: soapNote.subjective_data || {
        symptoms: [],
        painScale: null,
        painDescription: "",
        otherSymptoms: "",
        isRefused: false,
        isWithinNormalLimits: false
      },
      objective: soapNote.objective_data || {
        vitalSigns: soapNote.vital_signs || {
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
      assessment: soapNote.assessment_data || {
        diagnoses: [],
        clinicalImpression: ""
      },
      plan: soapNote.plan_data || {
        treatments: [],
        customTreatment: "",
        medications: [],
        followUpPeriod: "",
        customFollowUp: "",
        hasEmergencyDisclaimer: true,
        legalTags: [],
        additionalInstructions: ""
      }
    };
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