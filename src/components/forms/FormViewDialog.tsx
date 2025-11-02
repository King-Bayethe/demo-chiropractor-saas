import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormSubmissionDetails } from "./FormSubmissionDetails";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormViewDialogProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormViewDialog = ({ submission, open, onOpenChange }: FormViewDialogProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Downloading form submission as PDF..."
    });
  };

  const handleCreatePatient = () => {
    toast({
      title: "Create Patient",
      description: "This will create a new patient from this submission."
    });
  };

  const getFormTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      pip: "PIP Form",
      lop: "LOP Form",
      cash: "Cash Form",
      new: "New Patient Form"
    };
    return types[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{submission.patient_name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{getFormTypeLabel(submission.form_type)}</Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted on {format(new Date(submission.submitted_at), 'MMMM dd, yyyy')} at {format(new Date(submission.submitted_at), 'h:mm a')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="default" size="sm" onClick={handleCreatePatient}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Patient
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <FormSubmissionDetails
            formData={submission.form_data}
            formType={submission.form_type}
            submissionDate={submission.submitted_at}
            submissionId={submission.id}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
