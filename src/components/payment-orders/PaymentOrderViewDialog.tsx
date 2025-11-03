import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PaymentOrder } from "@/utils/mockData/mockPaymentOrders";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { Play, Pause, X, Edit, Calendar, CreditCard } from "lucide-react";

interface PaymentOrderViewDialogProps {
  order: PaymentOrder | null;
  onClose: () => void;
  onProcessNow: (order: PaymentOrder) => void;
  onTogglePause: (order: PaymentOrder) => void;
  onCancel: (order: PaymentOrder) => void;
  onEdit: (order: PaymentOrder) => void;
  getPaymentProgress: (order: PaymentOrder) => number;
}

export const PaymentOrderViewDialog = ({
  order,
  onClose,
  onProcessNow,
  onTogglePause,
  onCancel,
  onEdit,
  getPaymentProgress,
}: PaymentOrderViewDialogProps) => {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success/10 text-success border-success/20",
      paused: "bg-warning/10 text-warning border-warning/20",
      completed: "bg-info/10 text-info border-info/20",
      cancelled: "bg-muted text-muted-foreground border-border",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  const progress = getPaymentProgress(order);
  const totalPaid = order.amount * order.paymentsMade;
  const totalPlanned = order.totalPayments ? order.amount * order.totalPayments : 0;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{order.description}</DialogTitle>
              <div className="mt-2">{getStatusBadge(order.status)}</div>
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
              <p className="font-semibold text-lg">{order.patientName}</p>
              <p className="text-sm text-muted-foreground">Patient ID: {order.patientId}</p>
            </CardContent>
          </Card>

          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(order.amount)}
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    per {order.frequency === 'biweekly' ? 'bi-week' : order.frequency === 'custom' ? `${order.customFrequencyDays} days` : order.frequency.replace('-', ' ')}
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(order.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {order.endDate ? format(new Date(order.endDate), 'MMM dd, yyyy') : 'Ongoing'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Payment Progress</span>
                  <span className="text-sm font-semibold">
                    {order.paymentsMade} of {order.totalPayments || '∞'} payments made
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(totalPaid)}</p>
                </div>
                {order.totalPayments && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Planned</p>
                    <p className="text-lg font-bold">{formatCurrency(totalPlanned)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="text-xl font-semibold text-primary">
                  {format(new Date(order.nextPaymentDate), 'MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-2xl font-bold">{formatCurrency(order.amount)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Payment method on file</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{format(new Date(payment.date), 'MMM dd, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        payment.status === 'success'
                          ? 'bg-success/10 text-success border-success/20'
                          : payment.status === 'failed'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={() => onProcessNow(order)} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Process Payment Now
            </Button>
            <Button variant="outline" onClick={() => onTogglePause(order)} className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              {order.status === 'paused' ? 'Resume' : 'Pause'} Plan
            </Button>
            <Button variant="outline" onClick={() => onEdit(order)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onCancel(order)}>
              <X className="h-4 w-4 mr-2" />
              Cancel Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
