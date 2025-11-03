import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Download, XCircle } from "lucide-react";
import { Transaction } from "@/utils/mockData/mockTransactions";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  onDownloadReceipt: (transaction: Transaction) => void;
  onVoidTransaction: (transaction: Transaction) => void;
}

export const TransactionsTable = ({
  transactions,
  onViewTransaction,
  onDownloadReceipt,
  onVoidTransaction,
}: TransactionsTableProps) => {
  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      payment: "bg-success/10 text-success border-success/20",
      refund: "bg-destructive/10 text-destructive border-destructive/20",
      adjustment: "bg-warning/10 text-warning border-warning/20",
      fee: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={variants[type] || variants.fee}>
        {type}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    return (
      <Badge variant="outline" className="bg-info/10 text-info border-info/20">
        {method.replace('_', ' ')}
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
      <Badge variant="outline" className={variants[status] || variants.pending}>
        {status}
      </Badge>
    );
  };

  const getAmountClass = (amount: number) => {
    if (amount > 0) return "text-success font-semibold";
    if (amount < 0) return "text-destructive font-semibold";
    return "text-foreground font-semibold";
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className="cursor-pointer transition-all hover:bg-muted/50"
              onClick={() => onViewTransaction(transaction)}
            >
              <TableCell className="font-medium">
                {format(new Date(transaction.date), 'MMM dd, yyyy h:mm a')}
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {transaction.transactionNumber}
                </code>
              </TableCell>
              <TableCell>{transaction.patientId}</TableCell>
              <TableCell>{getTypeBadge(transaction.type)}</TableCell>
              <TableCell>{getPaymentMethodBadge(transaction.paymentMethod)}</TableCell>
              <TableCell className={`text-right ${getAmountClass(transaction.amount)}`}>
                {transaction.amount < 0 && '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewTransaction(transaction); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownloadReceipt(transaction); }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </DropdownMenuItem>
                    {transaction.status === 'completed' && (
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onVoidTransaction(transaction); }}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Void Transaction
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
