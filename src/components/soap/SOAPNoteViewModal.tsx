import { useState, useEffect } from "react";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { useSOAPNotes } from "@/hooks/useSOAPNotes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOAPViewer } from "./SOAPViewer";
import { EnhancedPatientContextHeader } from "./EnhancedPatientContextHeader";
import { format } from "date-fns";
import { 
  Edit, 
  Download, 
  User,
  Calendar,
  Stethoscope,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SOAPNoteViewModalProps {
  noteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (noteId: string) => void;
  onExport?: (noteId: string) => void;
  getSOAPNote?: (noteId: string) => Promise<SOAPNote | null>;
}

export function SOAPNoteViewModal({ 
  noteId, 
  isOpen, 
  onClose, 
  onEdit, 
  onExport,
  getSOAPNote: propGetSOAPNote
}: SOAPNoteViewModalProps) {
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [loading, setLoading] = useState(false);
  const { getSOAPNote: hookGetSOAPNote } = useSOAPNotes();
  const navigate = useNavigate();
  
  // Use prop function if provided, otherwise use hook function
  const getSOAPNote = propGetSOAPNote || hookGetSOAPNote;

  useEffect(() => {
    if (noteId && isOpen) {
      console.log("SOAPNoteViewModal: Fetching note with ID:", noteId);
      setLoading(true);
      getSOAPNote(noteId)
        .then((note) => {
          console.log("SOAPNoteViewModal: Fetched note:", note);
          setSOAPNote(note);
        })
        .catch((error) => {
          console.error("SOAPNoteViewModal: Error fetching note:", error);
          setSOAPNote(null);
        })
        .finally(() => setLoading(false));
    }
  }, [noteId, isOpen, getSOAPNote]);

  const handleEdit = () => {
    if (soapNote) {
      onEdit?.(soapNote.id);
      onClose();
      navigate(`/soap-notes/edit/${soapNote.id}`);
    }
  };

  const handleExport = async () => {
    if (soapNote) {
      try {
        const { exportSOAPNoteToPDF } = await import("@/services/pdfExport");
        await exportSOAPNoteToPDF(soapNote, getPatientName());
        onExport?.(soapNote.id);
      } catch (error) {
        console.error("Failed to export PDF:", error);
      }
    }
  };

  const getPatientName = (): string => {
    if (!soapNote) return 'Unknown Patient';
    if (soapNote.patients?.first_name || soapNote.patients?.last_name) {
      return `${soapNote.patients.first_name || ''} ${soapNote.patients.last_name || ''}`.trim();
    }
    return soapNote.patients?.email || 'Unknown Patient';
  };

  const getStatusBadge = () => {
    if (!soapNote) return null;
    
    return (
      <Badge 
        variant={soapNote.is_draft ? "secondary" : "default"}
        className={
          soapNote.is_draft 
            ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
            : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
        }
      >
        {soapNote.is_draft ? 'Draft' : 'Complete'}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading SOAP note...</p>
            </div>
          </div>
        ) : !soapNote ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">SOAP Note Not Found</h3>
              <p className="text-sm text-muted-foreground">The requested SOAP note could not be found.</p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    {soapNote.chief_complaint || 'SOAP Note'}
                    {getStatusBadge()}
                  </DialogTitle>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {getPatientName()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(soapNote.date_of_service), 'PPP')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" />
                      {soapNote.provider_name}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Note
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {soapNote.patients && (
                <EnhancedPatientContextHeader patient={soapNote.patients} />
              )}
              
              <SOAPViewer soapNote={soapNote} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}