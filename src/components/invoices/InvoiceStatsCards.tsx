import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { InvoiceStats } from "@/hooks/useInvoices";
import { formatCurrency } from "@/utils/formatters";

interface InvoiceStatsCardsProps {
  stats: InvoiceStats;
}

export const InvoiceStatsCards = ({ stats }: InvoiceStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Outstanding
              </p>
              <p className={`text-3xl font-bold mt-2 ${stats.outstanding > 5000 ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'}`}>
                {formatCurrency(stats.outstanding)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.outstanding > 5000 ? 'bg-yellow-500/10' : 'bg-muted'}`}>
              <AlertTriangle className={`h-6 w-6 ${stats.outstanding > 5000 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Paid This Month
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {formatCurrency(stats.paidThisMonth)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Overdue Invoices
              </p>
              <p className={`text-3xl font-bold mt-2 ${stats.overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                {stats.overdueCount}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.overdueCount > 0 ? 'bg-red-500/10' : 'bg-muted'}`}>
              <Clock className={`h-6 w-6 ${stats.overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
