import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { SOAPViewer } from "@/components/soap/SOAPViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes, SOAPNote } from "@/hooks/useSOAPNotes";
import { ArrowLeft, Edit, Download, Eye, Calendar, User } from "lucide-react";
import { PatientContextHeader } from "@/components/soap/PatientContextHeader";
import { SOAPNoteBreadcrumb } from "@/components/soap/SOAPNoteBreadcrumb";
import { format } from "date-fns";

export default function ViewSOAPNote() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { getSOAPNote } = useSOAPNotes();

  useEffect(() => {
    const loadSOAPNote = async () => {
      if (!id) {
        navigate('/soap-notes');
        return;
      }

      try {
        setLoading(true);
        const note = await getSOAPNote(id);
        
        if (note) {
          setSoapNote(note);
        } else {
          toast({
            title: "SOAP Note Not Found",
            description: "The requested SOAP note could not be found.",
            variant: "destructive",
          });
          navigate('/soap-notes');
        }
      } catch (error) {
        console.error('Failed to load SOAP note:', error);
        toast({
          title: "Error",
          description: "Failed to load SOAP note. Please try again.",
          variant: "destructive",
        });
        navigate('/soap-notes');
      } finally {
        setLoading(false);
      }
    };

    loadSOAPNote();
  }, [id, getSOAPNote, navigate, toast]);

  const handleEdit = () => {
    navigate(`/soap-notes/edit/${id}`);
  };

  const handleViewPatientProfile = () => {
    if (soapNote?.patient_id) {
      navigate(`/patients/${soapNote.patient_id}`);
    }
  };

  const handleExportPDF = () => {
    if (!soapNote) return;
    
    try {
      import('../services/pdfExport').then(({ exportSOAPNoteToPDF }) => {
        const patientName = getPatientName(soapNote);
        exportSOAPNoteToPDF(soapNote, patientName);
        toast({
          title: "PDF Export",
          description: "SOAP note exported successfully!",
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

  const getPatientName = (note: SOAPNote): string => {
    if (note.patients) {
      return `${note.patients.first_name} ${note.patients.last_name}`.trim();
    }
    return 'Unknown Patient';
  };

  const getStatusBadge = (note: SOAPNote) => {
    if (note.is_draft) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Draft
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Completed
      </Badge>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
          <div className="min-h-screen flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">SOAP Note Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The requested SOAP note could not be found.
                </p>
                <Button onClick={() => navigate('/soap-notes')}>
                  Return to SOAP Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/soap-notes')} 
                  className="mr-4 hover:bg-primary/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to SOAP Notes
                </Button>
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        SOAP Note Details
                      </h1>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {getPatientName(soapNote)}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(soapNote.date_of_service), 'PPP')}
                        </div>
                        {getStatusBadge(soapNote)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {soapNote?.patient_id && (
                  <Button 
                    variant="outline" 
                    onClick={handleViewPatientProfile}
                    className="hover:bg-primary/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Patient Profile
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleExportPDF}
                  className="hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Note
                </Button>
              </div>
            </div>

            {/* SOAP Note Content */}
            <SOAPViewer soapNote={soapNote} />
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}