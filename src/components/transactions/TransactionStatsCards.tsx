import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { TransactionStats } from "@/hooks/useTransactions";
import { formatCurrency } from "@/utils/formatters";

interface TransactionStatsCardsProps {
  stats: TransactionStats;
}

export const TransactionStatsCards = ({ stats }: TransactionStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Income
              </p>
              <p className="text-3xl font-bold text-success mt-2">
                {formatCurrency(stats.totalIncome)}
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
                Total Refunds
              </p>
              <p className="text-3xl font-bold text-destructive mt-2">
                {formatCurrency(stats.totalRefunds)}
              </p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Net Revenue
              </p>
              <p className={`text-3xl font-bold mt-2 ${stats.netRevenue >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.netRevenue)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Transaction Volume
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.transactionVolume}
              </p>
            </div>
            <div className="p-3 bg-info/10 rounded-lg">
              <Activity className="h-6 w-6 text-info" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
