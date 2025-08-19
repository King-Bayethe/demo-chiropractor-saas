import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { 
  FileText, 
  Eye, 
  Edit, 
  Download, 
  Trash2, 
  Clock,
  User,
  Stethoscope,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SOAPNoteTimelineProps {
  soapNotes: SOAPNote[];
  onDelete?: (noteId: string) => void;
  onExport?: (noteId: string) => void;
}

export function SOAPNoteTimeline({ 
  soapNotes, 
  onDelete, 
  onExport 
}: SOAPNoteTimelineProps) {
  const navigate = useNavigate();

  // Sort notes by date of service in descending order (most recent first)
  const sortedNotes = [...soapNotes].sort((a, b) => 
    new Date(b.date_of_service).getTime() - new Date(a.date_of_service).getTime()
  );

  const handleView = (noteId: string) => {
    navigate(`/soap-notes/${noteId}/view`);
  };

  const handleEdit = (noteId: string) => {
    navigate(`/soap-notes/${noteId}/edit`);
  };

  const getStatusColor = (isDraft: boolean) => {
    return isDraft 
      ? "bg-warning/20 text-warning border-warning/30"
      : "bg-success/20 text-success border-success/30";
  };

  if (sortedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No SOAP Notes Yet</h3>
        <p className="text-sm">This patient doesn't have any SOAP notes recorded.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
      
      <div className="space-y-6">
        {sortedNotes.map((note, index) => (
          <div key={note.id} className="relative flex gap-4">
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm"></div>
            </div>
            
            {/* Timeline content */}
            <Card className="flex-1 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Header with date and status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <time className="font-semibold text-foreground">
                      {format(new Date(note.date_of_service), 'PPP')}
                    </time>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(note.is_draft)}
                    >
                      {note.is_draft ? 'Draft' : 'Complete'}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(note.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {onExport && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExport(note.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(note.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Chief complaint */}
                <div className="flex items-start gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      {note.chief_complaint || 'No chief complaint recorded'}
                    </h4>
                  </div>
                </div>

                {/* Provider and metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    <span>{note.provider_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last updated {format(new Date(note.updated_at), 'p')}</span>
                  </div>
                </div>

                {/* SOAP sections preview */}
                <div className="space-y-2">
                  {note.subjective_data && Object.keys(note.subjective_data).length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Subjective: </span>
                      <span className="text-muted-foreground">
                        {typeof note.subjective_data === 'object' 
                          ? Object.keys(note.subjective_data).length + ' entries'
                          : 'Data recorded'
                        }
                      </span>
                    </div>
                  )}
                  
                  {note.objective_data && Object.keys(note.objective_data).length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Objective: </span>
                      <span className="text-muted-foreground">
                        {typeof note.objective_data === 'object' 
                          ? Object.keys(note.objective_data).length + ' findings'
                          : 'Data recorded'
                        }
                      </span>
                    </div>
                  )}
                  
                  {note.assessment_data && Object.keys(note.assessment_data).length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Assessment: </span>
                      <span className="text-muted-foreground">
                        {typeof note.assessment_data === 'object' 
                          ? Object.keys(note.assessment_data).length + ' diagnoses'
                          : 'Assessment recorded'
                        }
                      </span>
                    </div>
                  )}
                  
                  {note.plan_data && Object.keys(note.plan_data).length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-muted-foreground">Plan: </span>
                      <span className="text-muted-foreground">
                        {typeof note.plan_data === 'object' 
                          ? Object.keys(note.plan_data).length + ' treatment items'
                          : 'Treatment plan recorded'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* View details button */}
                <div className="flex justify-end mt-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(note.id)}
                    className="text-xs"
                  >
                    View Full Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}