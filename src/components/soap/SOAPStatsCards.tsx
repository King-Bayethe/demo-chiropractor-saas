import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, Clock, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SOAPStatsCardsProps {
  totalNotes: number;
  notesThisMonth: number;
  avgCompletionTime: number;
  activeProviders: number;
}

export function SOAPStatsCards({
  totalNotes,
  notesThisMonth,
  avgCompletionTime,
  activeProviders,
}: SOAPStatsCardsProps) {
  const isMobile = useIsMobile();

  const stats = [
    {
      title: "Total Notes",
      value: totalNotes,
      icon: FileText,
      description: "All time",
    },
    {
      title: "This Month",
      value: notesThisMonth,
      icon: TrendingUp,
      description: "Current month",
    },
    {
      title: "Avg Time",
      value: `${avgCompletionTime} min`,
      icon: Clock,
      description: "Per note",
    },
    {
      title: "Providers",
      value: activeProviders,
      icon: Users,
      description: "Active",
    },
  ];

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    )}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="bg-gradient-to-br from-card to-muted/20 border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={cn(
                    "font-bold text-foreground",
                    isMobile ? "text-xl" : "text-2xl"
                  )}>
                    {stat.value}
                  </p>
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {stat.description}
                  </p>
                </div>
                <div className={cn(
                  "rounded-full p-2 bg-primary/10",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <Icon className={cn(
                    "text-primary",
                    isMobile ? "w-4 h-4" : "w-5 h-5"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
