import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Send, Download, CheckCircle, Trash2, Edit } from "lucide-react";
import { Invoice } from "@/utils/mockData/mockInvoices";
import { format, isPast, isToday } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoicesTable = ({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onMarkAsPaid,
  onDeleteInvoice,
}: InvoicesTableProps) => {
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

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getDueDateClass = (dueDate: string, status: Invoice['status']) => {
    if (status === 'paid' || status === 'cancelled') return 'text-muted-foreground';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'text-red-600 dark:text-red-400 font-semibold';
    if (isToday(date)) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-foreground';
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    return isPast(dueDate) && !isToday(dueDate);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16">
        <DollarSign className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No invoices found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or create a new invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Invoice #</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Patient</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">Amount</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Date Issued</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Due Date</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                isOverdue(invoice) ? 'border-l-4 border-l-red-500' : ''
              }`}
              onClick={() => onViewInvoice(invoice)}
            >
              <TableCell>
                <span className="font-mono text-sm font-medium text-foreground">
                  {invoice.invoiceNumber}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {invoice.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{invoice.patientName}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-semibold text-foreground">
                  {formatCurrency(invoice.total)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">
                  {format(new Date(invoice.dateIssued), 'MMM dd, yyyy')}
                </span>
              </TableCell>
              <TableCell>
                <span className={`text-sm ${getDueDateClass(invoice.dueDate, invoice.status)}`}>
                  {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-border">
                    <DropdownMenuItem onClick={() => onViewInvoice(invoice)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditInvoice(invoice)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDeleteInvoice(invoice.id)}
                      className="text-red-600 dark:text-red-400"
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
};

const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
