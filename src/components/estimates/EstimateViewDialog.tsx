import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Estimate } from "@/utils/mockData/mockEstimates";
import { format } from "date-fns";
import { FileText, Send, Edit, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface EstimateViewDialogProps {
  estimate: Estimate | null;
  onClose: () => void;
  onEdit?: (estimate: Estimate) => void;
  onDelete?: (id: string) => void;
}

export function EstimateViewDialog({ 
  estimate, 
  onClose,
  onEdit,
  onDelete 
}: EstimateViewDialogProps) {
  if (!estimate) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      draft: { className: "bg-gray-500/10 text-gray-700 border-gray-200" },
      sent: { className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      accepted: { className: "bg-green-500/10 text-green-700 border-green-200" },
      rejected: { className: "bg-red-500/10 text-red-700 border-red-200" },
      expired: { className: "bg-gray-500/10 text-gray-700 border-gray-200" },
    };

    return (
      <Badge variant="outline" className={variants[status]?.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={!!estimate} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {estimate.estimateNumber}
            </DialogTitle>
            {getStatusBadge(estimate.status)}
          </div>
        </DialogHeader>

        {/* Patient Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Patient Information</h3>
          <p className="text-muted-foreground">{estimate.patientName}</p>
        </div>

        <Separator />

        {/* Treatment Type */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Treatment Plan</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {estimate.treatmentType}
          </Badge>
        </div>

        <Separator />

        {/* Treatment Phases */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Treatment Phases</h3>
          {estimate.phases.map((phase) => (
            <div 
              key={phase.id}
              className="border border-border/50 rounded-lg p-4 bg-gradient-to-br from-background to-muted/10"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground">{phase.name}</h4>
                <span className="font-bold text-lg">${phase.total.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{phase.sessions} sessions</span>
                <span>•</span>
                <span>${phase.pricePerSession} per session</span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${estimate.subtotal.toLocaleString()}</span>
          </div>
          {estimate.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${estimate.discount.toLocaleString()}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Estimated Cost</span>
            <span className="text-2xl">${estimate.total.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{format(new Date(estimate.dateCreated), 'PPP')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valid Until</p>
            <p className="font-medium">{format(new Date(estimate.validUntil), 'PPP')}</p>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Notes</h3>
              <p className="text-sm text-muted-foreground">{estimate.notes}</p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4">
          {onEdit && (
            <Button onClick={() => onEdit(estimate)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {estimate.status === 'draft' && (
            <Button variant="default">
              <Send className="h-4 w-4 mr-2" />
              Send to Patient
            </Button>
          )}
          {estimate.status === 'sent' && (
            <>
              <Button variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Accepted
              </Button>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Mark Rejected
              </Button>
            </>
          )}
          {estimate.status === 'accepted' && (
            <Button variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Convert to Invoice
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive"
              onClick={() => {
                onDelete(estimate.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
