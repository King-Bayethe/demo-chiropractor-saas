import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, DollarSign } from "lucide-react";
import { EstimateStats } from "@/hooks/useEstimates";

interface EstimateStatsCardsProps {
  stats: EstimateStats;
}

export function EstimateStatsCards({ stats }: EstimateStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Estimates
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {stats.totalEstimates}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Pending Review
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {stats.pendingReview}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Acceptance Rate
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                {stats.acceptanceRate.toFixed(1)}%
              </p>
              <div className="mt-2 w-full bg-muted/30 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.acceptanceRate}%` }}
                />
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Estimated Revenue
              </p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                ${stats.estimatedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
