import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  title: string;
  color: string;
  count: number;
}

interface PipelineFlowHeaderProps {
  stages: PipelineStage[];
  className?: string;
}

export function PipelineFlowHeader({ stages, className }: PipelineFlowHeaderProps) {
  return (
    <Card className={cn("border-0 shadow-none bg-muted/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                  <span className="font-medium text-sm whitespace-nowrap">{stage.title}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{stage.count}</div>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}