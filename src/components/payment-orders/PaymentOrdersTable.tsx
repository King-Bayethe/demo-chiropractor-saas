import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Eye, Play, Pause, X, Edit } from "lucide-react";
import { PaymentOrder } from "@/utils/mockData/mockPaymentOrders";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";

interface PaymentOrdersTableProps {
  orders: PaymentOrder[];
  onViewOrder: (order: PaymentOrder) => void;
  onEditOrder: (order: PaymentOrder) => void;
  onProcessNow: (order: PaymentOrder) => void;
  onTogglePause: (order: PaymentOrder) => void;
  onCancelOrder: (order: PaymentOrder) => void;
  getPaymentProgress: (order: PaymentOrder) => number;
  isUpcomingThisWeek: (date: string) => boolean;
}

export const PaymentOrdersTable = ({
  orders,
  onViewOrder,
  onEditOrder,
  onProcessNow,
  onTogglePause,
  onCancelOrder,
  getPaymentProgress,
  isUpcomingThisWeek,
}: PaymentOrdersTableProps) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      active: { variant: "default", className: "bg-success/10 text-success border-success/20" },
      paused: { variant: "secondary", className: "bg-warning/10 text-warning border-warning/20" },
      completed: { variant: "secondary", className: "bg-info/10 text-info border-info/20" },
      cancelled: { variant: "outline", className: "" },
      failed: { variant: "destructive", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      weekly: "bg-info/10 text-info border-info/20",
      "bi-weekly": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      monthly: "bg-success/10 text-success border-success/20",
      custom: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[frequency] || colors.custom}>
        {frequency}
      </Badge>
    );
  };

  const getNextPaymentClass = (date: string) => {
    const nextPayment = new Date(date);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    if (nextPayment < today) return "text-destructive font-semibold";
    if (nextPayment <= threeDaysFromNow) return "text-warning font-semibold";
    return "text-foreground";
  };

  const isDueThisWeek = (date: string) => isUpcomingThisWeek(date);
  const isFailed = (status: string) => status === 'failed';

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No payment orders found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={`cursor-pointer transition-all hover:bg-muted/50 ${
                isDueThisWeek(order.nextPaymentDate) ? 'border-l-4 border-l-warning' : ''
              } ${isFailed(order.status) ? 'bg-destructive/5' : ''}`}
              onClick={() => onViewOrder(order)}
            >
              <TableCell className="font-medium">{order.patientName}</TableCell>
              <TableCell className="max-w-[200px] truncate">{order.description}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(order.amount)}</TableCell>
              <TableCell>{getFrequencyBadge(order.frequency)}</TableCell>
              <TableCell className={getNextPaymentClass(order.nextPaymentDate)}>
                {format(new Date(order.nextPaymentDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {order.paymentsMade}/{order.totalPayments || '∞'}
                  </div>
                  <Progress value={getPaymentProgress(order)} className="h-1.5" />
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewOrder(order); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onProcessNow(order); }}>
                      <Play className="h-4 w-4 mr-2" />
                      Process Now
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePause(order); }}>
                      <Pause className="h-4 w-4 mr-2" />
                      {order.status === 'paused' ? 'Resume' : 'Pause'} Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditOrder(order); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); onCancelOrder(order); }}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Plan
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
