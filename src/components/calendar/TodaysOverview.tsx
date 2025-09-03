import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TodaysOverviewProps {
  todaysStats?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export function TodaysOverview({ todaysStats }: TodaysOverviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Today's Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Appointments</span>
          <span className="font-medium">{todaysStats?.total || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completed</span>
          <span className="font-medium text-success">{todaysStats?.completed || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pending</span>
          <span className="font-medium text-warning">{todaysStats?.pending || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cancelled</span>
          <span className="font-medium text-destructive">{todaysStats?.cancelled || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}