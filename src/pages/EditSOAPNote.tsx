import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import EditableSOAPForm from "@/components/soap/EditableSOAPForm";
import { PatientContextHeader } from "@/components/soap/PatientContextHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import { supabase } from "@/integrations/supabase/client";
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
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const { getSOAPNote } = useSOAPNotes();

  useEffect(() => {
    const loadPatientData = async () => {
      if (!id) return;
      
      try {
        const note = await getSOAPNote(id);
        if (note?.patient_id) {
          // Load patient data from patients table
          const { data: patientData } = await supabase
            .from('patients')
            .select('*')
            .eq('id', note.patient_id)
            .single();
          
          if (patientData) {
            setPatient(patientData);
          }
        }
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    };

    loadPatientData();
  }, [id, getSOAPNote]);

  return (
    <AuthGuard>
      <Layout>
        <div className="container max-w-6xl mx-auto px-6 py-8">
          {patient && <PatientContextHeader patient={patient} />}
          <EditableSOAPForm />
        </div>
      </Layout>
    </AuthGuard>
  );
}