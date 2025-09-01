import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  title: string;
  color: string;
  count: number;
  percentage: number;
}

interface PipelineStageSummaryProps {
  stages: PipelineStage[];
  totalOpportunities: number;
  className?: string;
}

export function PipelineStageSummary({ stages, totalOpportunities, className }: PipelineStageSummaryProps) {
  return (
    <Card className={cn("border-0 shadow-none bg-muted/20", className)}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full", stage.color)} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{stage.title}</span>
                <span className="text-xs text-muted-foreground">
                  {stage.count} ({stage.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}