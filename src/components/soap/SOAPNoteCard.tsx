import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { format } from "date-fns";
import { 
  Eye, 
  Edit, 
  Download, 
  Trash2, 
  FileText,
  User,
  Calendar,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SOAPNoteCardProps {
  note: SOAPNote;
  onDelete?: (noteId: string) => void;
  onExport?: (noteId: string) => void;
  showPatientName?: boolean;
  compact?: boolean;
}

export function SOAPNoteCard({ 
  note, 
  onDelete, 
  onExport, 
  showPatientName = false,
  compact = false 
}: SOAPNoteCardProps) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/soap-notes/${note.id}/view`);
  };

  const handleEdit = () => {
    navigate(`/soap-notes/${note.id}/edit`);
  };

  const handleExport = () => {
    onExport?.(note.id);
  };

  const handleDelete = () => {
    onDelete?.(note.id);
  };

  const getPatientName = (): string => {
    if (note.patients?.first_name || note.patients?.last_name) {
      return `${note.patients.first_name || ''} ${note.patients.last_name || ''}`.trim();
    }
    return note.patients?.email || 'Unknown Patient';
  };

  const getStatusColor = (isDraft: boolean) => {
    return isDraft 
      ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
      : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <p className="font-medium text-sm truncate">{note.chief_complaint || 'No chief complaint'}</p>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(note.is_draft)}`}
            >
              {note.is_draft ? 'Draft' : 'Complete'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(note.date_of_service), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {note.provider_name}
            </div>
            {showPatientName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {getPatientName()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold truncate">{note.chief_complaint || 'No chief complaint'}</h3>
              <Badge 
                variant="secondary" 
                className={getStatusColor(note.is_draft)}
              >
                {note.is_draft ? 'Draft' : 'Complete'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(note.date_of_service), 'PPP')}
              </div>
              <div className="flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                {note.provider_name}
              </div>
              {showPatientName && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {getPatientName()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Last updated: {format(new Date(note.updated_at), 'MMM d, yyyy p')}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}