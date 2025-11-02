import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  patient_id: string;
  name: string;
  file_type: string;
  category: string;
  status: string;
  description?: string;
  created_at: string;
  tags?: string[];
  file_size?: number;
  uploaded_by?: string;
}

interface DocumentViewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentViewDialog = ({ document, open, onOpenChange }: DocumentViewDialogProps) => {
  if (!document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Preview Area */}
          <div className="bg-muted/30 rounded-lg border-2 border-dashed p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Document preview not available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click download to view the full document
            </p>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <div className="mt-1">
                <Badge variant="outline">{document.category}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge>{document.status}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">File Type</label>
              <p className="mt-1 uppercase">{document.file_type}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">File Size</label>
              <p className="mt-1">{formatFileSize(document.file_size)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
              <p className="mt-1">{format(new Date(document.created_at), "PPP")}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Uploaded By</label>
              <p className="mt-1">{document.uploaded_by || "System"}</p>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-sm">{document.description}</p>
            </div>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
