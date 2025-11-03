import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { PaymentOrderStats } from "@/hooks/usePaymentOrders";
import { formatCurrency } from "@/utils/formatters";

interface PaymentOrderStatsCardsProps {
  stats: PaymentOrderStats;
}

export const PaymentOrderStatsCards = ({ stats }: PaymentOrderStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Plans
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.activePlans}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Monthly Recurring Revenue
              </p>
              <p className="text-3xl font-bold text-success mt-2">
                {formatCurrency(stats.monthlyRecurringRevenue)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Upcoming This Week
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.upcomingThisWeek}
              </p>
            </div>
            <div className="p-3 bg-info/10 rounded-lg">
              <Calendar className="h-6 w-6 text-info" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Failed Payments
              </p>
              <p className={`text-3xl font-bold mt-2 ${stats.failedPayments > 0 ? 'text-destructive' : 'text-foreground'}`}>
                {stats.failedPayments}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.failedPayments > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <AlertCircle className={`h-6 w-6 ${stats.failedPayments > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
