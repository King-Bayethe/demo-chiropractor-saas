import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Transaction } from "@/utils/mockData/mockTransactions";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { Download, Mail, XCircle } from "lucide-react";

interface TransactionViewDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDownloadReceipt: (transaction: Transaction) => void;
  onEmailReceipt: (transaction: Transaction) => void;
  onVoid: (transaction: Transaction) => void;
}

export const TransactionViewDialog = ({
  transaction,
  onClose,
  onDownloadReceipt,
  onEmailReceipt,
  onVoid,
}: TransactionViewDialogProps) => {
  if (!transaction) return null;

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      payment: "bg-success/10 text-success border-success/20",
      refund: "bg-destructive/10 text-destructive border-destructive/20",
      adjustment: "bg-warning/10 text-warning border-warning/20",
      fee: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={variants[type]}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
      refunded: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-mono">{transaction.transactionNumber}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(transaction.date), 'MMMM dd, yyyy h:mm a')}
              </p>
              <div className="flex gap-2 mt-2">
                {getTypeBadge(transaction.type)}
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">Patient ID: {transaction.patientId}</p>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className={`text-4xl font-bold ${transaction.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {transaction.amount < 0 && '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/20 mt-1">
                    {transaction.paymentMethod.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Type</p>
                  <div className="mt-1">{getTypeBadge(transaction.type)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b">
                  <div>
                    <p className="font-medium">Transaction Created</p>
                    <p className="text-sm text-muted-foreground">System</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
                {transaction.status === 'completed' && (
                  <div className="flex justify-between items-start py-2 border-b">
                    <div>
                      <p className="font-medium">Transaction Processed</p>
                      <p className="text-sm text-muted-foreground">Payment Gateway</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={() => onDownloadReceipt(transaction)} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={() => onEmailReceipt(transaction)} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email Receipt
            </Button>
            {transaction.status === 'completed' && transaction.type === 'payment' && (
              <Button variant="destructive" onClick={() => onVoid(transaction)}>
                <XCircle className="h-4 w-4 mr-2" />
                Void Transaction
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
