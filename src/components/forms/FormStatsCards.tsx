import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useFormStats } from "@/hooks/useFormSubmissions";
import { Skeleton } from "@/components/ui/skeleton";

export const FormStatsCards = () => {
  const { data: stats, isLoading } = useFormStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Submissions",
      value: stats?.totalSubmissions || 0,
      icon: ClipboardList,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Pending Review",
      value: stats?.pendingCount || 0,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Avg Completion",
      value: `${stats?.avgCompletionTime || 0} min`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "This Month",
      value: stats?.thisMonthCount || 0,
      suffix: stats?.monthlyGrowth ? `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%` : '',
      icon: TrendingUp,
      color: stats?.monthlyGrowth && stats.monthlyGrowth > 0 ? "text-green-600" : "text-muted-foreground",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  {stat.suffix && (
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
