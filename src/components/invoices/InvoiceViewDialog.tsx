import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/utils/mockData/mockInvoices";
import { format } from "date-fns";
import { Calendar, Send, Download, CheckCircle, Edit, Trash2, FileText } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (id: string) => void;
  onMarkAsPaid?: (id: string) => void;
}

export const InvoiceViewDialog = ({
  invoice,
  onClose,
  onEdit,
  onDelete,
  onMarkAsPaid,
}: InvoiceViewDialogProps) => {
  if (!invoice) return null;

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      draft: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      sent: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
      paid: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
      overdue: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
      cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    };
    const labels = {
      draft: "Draft",
      sent: "Sent",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Invoice Preview</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Invoice #{invoice.invoiceNumber}
              </p>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 bg-gradient-to-br from-background to-muted/10 p-6 rounded-lg border border-border/50">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Medical Practice</h3>
              <p className="text-sm text-muted-foreground">123 Healthcare Blvd</p>
              <p className="text-sm text-muted-foreground">Medical City, MC 12345</p>
              <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="text-lg font-mono font-bold text-foreground">{invoice.invoiceNumber}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 justify-end text-sm">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="text-foreground">{format(new Date(invoice.dateIssued), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 justify-end text-sm">
                  <span className="text-muted-foreground">Due:</span>
                  <span className="text-foreground">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Patient Information */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bill To</h4>
            <p className="text-base font-semibold text-foreground">{invoice.patientName}</p>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Items</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({(invoice.taxRate * 100).toFixed(1)}%):</span>
                <span className="text-foreground">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.status === 'paid' && invoice.paidDate && (
            <>
              <Separator />
              <div className="bg-green-500/10 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Payment Received</p>
                    <p className="text-sm">
                      Paid on {format(new Date(invoice.paidDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Notes</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(invoice)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Invoice
            </Button>
          )}
          {onMarkAsPaid && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button onClick={() => onMarkAsPaid(invoice.id)} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => {
                onDelete(invoice.id);
                onClose();
              }}
              variant="outline"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Invoice
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
