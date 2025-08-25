import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormSubmissionDetails } from "@/components/forms/FormSubmissionDetails";
import { exportFormToCSV, exportFormToPDF } from "@/utils/formExport";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  FileText, 
  Users, 
  ClipboardList, 
  Eye,
  CheckCircle,
  Clock,
  Stethoscope,
  UserPlus,
  Activity
} from "lucide-react";

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  submitted_at: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  status: string;
}

interface PatientFormDisplayProps {
  forms: FormSubmission[];
  loading?: boolean;
}

export function PatientFormDisplay({ forms, loading = false }: PatientFormDisplayProps) {
  const getFormTypeDisplay = (type: string) => {
    switch (type) {
      case 'pip':
        return { name: 'PIP Patient Form', icon: ClipboardList, color: 'bg-blue-500/10 text-blue-700' };
      case 'lop':
        return { name: 'LOP Form', icon: FileText, color: 'bg-green-500/10 text-green-700' };
      case 'cash':
        return { name: 'Cash Patient Form', icon: Users, color: 'bg-purple-500/10 text-purple-700' };
      case 'soap_questionnaire':
        return { name: 'Chiropractic SOAP Questionnaire', icon: Stethoscope, color: 'bg-medical-teal/10 text-medical-teal' };
      case 'lead_intake':
        return { name: 'Lead Intake Form', icon: UserPlus, color: 'bg-orange-500/10 text-orange-700' };
      default:
        return { name: type, icon: FileText, color: 'bg-gray-500/10 text-gray-700' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // This renderFormData function is no longer needed as we use FormSubmissionDetails component

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Forms Submitted</h3>
        <p className="text-muted-foreground">This patient hasn't submitted any forms yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {forms.map((form) => {
        const formTypeInfo = getFormTypeDisplay(form.form_type);
        const IconComponent = formTypeInfo.icon;
        
        return (
          <Card key={form.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${formTypeInfo.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">{formTypeInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {format(new Date(form.submitted_at), 'PPP')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(form.status)}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {formTypeInfo.name}
                      </DialogTitle>
                      <DialogDescription>
                        Submitted on {format(new Date(form.submitted_at), 'PPP')} at {format(new Date(form.submitted_at), 'HH:mm')}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <FormSubmissionDetails
                        formData={form.form_data}
                        formType={form.form_type}
                        submissionDate={form.submitted_at}
                        submissionId={form.id}
                        patientName={form.patient_name || undefined}
                        onExport={(format) => {
                          try {
                            if (format === 'csv') {
                              exportFormToCSV(form);
                              toast.success("CSV exported successfully");
                            } else if (format === 'pdf') {
                              exportFormToPDF(form);
                              toast.success("PDF exported successfully");
                            }
                          } catch (error) {
                            console.error('Export error:', error);
                            toast.error(`Failed to export ${format.toUpperCase()}`);
                          }
                        }}
                      />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Quick preview of key form data */}
            <div className="text-sm text-muted-foreground">
              {form.form_data.firstName && form.form_data.lastName && (
                <span className="font-medium">{form.form_data.firstName} {form.form_data.lastName}</span>
              )}
              {form.form_data.email && (
                <span className="ml-2">• {form.form_data.email}</span>
              )}
              {form.form_data.cellPhone && (
                <span className="ml-2">• {form.form_data.cellPhone}</span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}