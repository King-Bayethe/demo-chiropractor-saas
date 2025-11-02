import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Send, CheckCircle, XCircle, FileText, Trash2 } from "lucide-react";
import { Estimate } from "@/utils/mockData/mockEstimates";
import { format, differenceInDays } from "date-fns";

interface EstimatesTableProps {
  estimates: Estimate[];
  onViewEstimate: (estimate: Estimate) => void;
  onEditEstimate: (estimate: Estimate) => void;
  onDeleteEstimate: (id: string) => void;
}

export function EstimatesTable({
  estimates,
  onViewEstimate,
  onEditEstimate,
  onDeleteEstimate,
}: EstimatesTableProps) {
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

  const getExpirationStatus = (validUntil: string, status: string) => {
    if (status === 'accepted' || status === 'rejected' || status === 'expired') {
      return null;
    }

    const daysUntilExpiration = differenceInDays(new Date(validUntil), new Date());
    
    if (daysUntilExpiration < 0) {
      return <span className="text-sm text-red-600 font-medium">Expired</span>;
    } else if (daysUntilExpiration <= 7) {
      return <span className="text-sm text-yellow-600 font-medium">Expires in {daysUntilExpiration}d</span>;
    }
    
    return null;
  };

  if (estimates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No estimates found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or create a new estimate</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Treatment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estimates.map((estimate) => (
            <TableRow 
              key={estimate.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewEstimate(estimate)}
            >
              <TableCell className="font-mono text-sm">{estimate.estimateNumber}</TableCell>
              <TableCell className="font-medium">{estimate.patientName}</TableCell>
              <TableCell className="max-w-xs truncate">{estimate.treatmentType}</TableCell>
              <TableCell className="text-right font-semibold">
                ${estimate.total.toLocaleString()}
              </TableCell>
              <TableCell>{format(new Date(estimate.dateCreated), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{format(new Date(estimate.validUntil), 'MMM dd, yyyy')}</span>
                  {getExpirationStatus(estimate.validUntil, estimate.status)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(estimate.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onViewEstimate(estimate);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditEstimate(estimate);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {estimate.status === 'draft' && (
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send to Patient
                      </DropdownMenuItem>
                    )}
                    {estimate.status === 'sent' && (
                      <>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="h-4 w-4 mr-2" />
                          Mark Rejected
                        </DropdownMenuItem>
                      </>
                    )}
                    {estimate.status === 'accepted' && (
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Convert to Invoice
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEstimate(estimate.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
