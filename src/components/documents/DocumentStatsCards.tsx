import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, TrendingUp, Archive } from "lucide-react";

interface DocumentStatsCardsProps {
  stats: {
    totalDocuments: number;
    pendingReview: number;
    thisMonth: number;
    fileTypes: number;
  };
}

export const DocumentStatsCards = ({ stats }: DocumentStatsCardsProps) => {
  const cards = [
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Review",
      value: stats.pendingReview,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "File Types",
      value: stats.fileTypes,
      icon: Archive,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
