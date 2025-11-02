import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { FormViewDialog } from "./FormViewDialog";

interface FormSubmission {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  form_type: string;
  status: string;
  submitted_at: string;
  form_data: any;
}

interface FormSubmissionsTableProps {
  submissions: FormSubmission[];
}

export const FormSubmissionsTable = ({ submissions }: FormSubmissionsTableProps) => {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const getFormTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      pip: { label: "PIP Form", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      lop: { label: "LOP Form", color: "bg-green-500/10 text-green-700 border-green-500/20" },
      cash: { label: "Cash Form", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
      new: { label: "New Patient", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" }
    };
    const config = types[type] || { label: type, color: "bg-muted text-muted-foreground" };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { icon: any; color: string }> = {
      pending: { icon: Clock, color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      reviewed: { icon: Eye, color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      completed: { icon: CheckCircle, color: "bg-green-500/10 text-green-700 border-green-500/20" }
    };
    const config = statuses[status] || { icon: AlertCircle, color: "bg-muted text-muted-foreground" };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Submissions Found</h3>
        <p className="text-muted-foreground">
          No form submissions match your current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Form Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {format(new Date(submission.submitted_at), 'MMM dd, yyyy')}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(submission.submitted_at), 'h:mm a')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{submission.patient_name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{submission.patient_email}</div>
                  <div className="text-xs text-muted-foreground">{submission.patient_phone}</div>
                </TableCell>
                <TableCell>{getFormTypeBadge(submission.form_type)}</TableCell>
                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSubmission && (
        <FormViewDialog
          submission={selectedSubmission}
          open={!!selectedSubmission}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
        />
      )}
    </>
  );
};
