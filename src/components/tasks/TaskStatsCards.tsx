import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { TaskStats } from "@/hooks/useTasks";

interface TaskStatsCardsProps {
  stats: TaskStats;
}

export const TaskStatsCards = ({ stats }: TaskStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Active
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.totalActive}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Overdue
              </p>
              <p className={`text-3xl font-bold mt-2 ${stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                {stats.overdue}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.overdue > 0 ? 'bg-red-500/10' : 'bg-muted'}`}>
              <AlertCircle className={`h-6 w-6 ${stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Due Today
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.dueToday}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Completion Rate
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.completionRate.toFixed(0)}%
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all" 
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
