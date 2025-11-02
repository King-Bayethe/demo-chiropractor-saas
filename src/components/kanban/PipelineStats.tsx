import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

interface PipelineStatsProps {
  totalOpportunities: number;
  totalValue: number;
  averageDealSize: number;
  activeContacts: number;
}

export function PipelineStats({
  totalOpportunities,
  totalValue,
  averageDealSize,
  activeContacts,
}: PipelineStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Total Opportunities",
      value: totalOpportunities,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg Deal Size",
      value: formatCurrency(averageDealSize),
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Active Contacts",
      value: activeContacts,
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
