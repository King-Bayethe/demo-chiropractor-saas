import React, { useState, useEffect, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PipelineDragProvider } from '@/components/pipeline/PipelineDragProvider';
import { EnhancedCompactOpportunityCard } from './EnhancedCompactOpportunityCard';
import { Opportunity, MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';
import { usePipelineResponsive } from '@/hooks/useUnifiedResponsive';
import { cn } from '@/lib/utils';

interface OptimizedKanbanBoardProps {
  opportunities: Opportunity[];
  stages: any[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
  className?: string;
}

interface StageColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  opportunities: Opportunity[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
  responsive: ReturnType<typeof usePipelineResponsive>;
}

function StageColumn({ stage, opportunities, onMoveOpportunity, responsive }: StageColumnProps) {
  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const getStageColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      '#ef4444': 'border-red-500 bg-red-50 text-red-700',
      '#f97316': 'border-orange-500 bg-orange-50 text-orange-700',
      '#eab308': 'border-yellow-500 bg-yellow-50 text-yellow-700',
      '#3b82f6': 'border-blue-500 bg-blue-50 text-blue-700',
      '#8b5cf6': 'border-violet-500 bg-violet-50 text-violet-700',
      '#06b6d4': 'border-cyan-500 bg-cyan-50 text-cyan-700',
      '#10b981': 'border-emerald-500 bg-emerald-50 text-emerald-700',
    };
    return colorMap[color] || 'border-gray-500 bg-gray-50 text-gray-700';
  };

  const handleMoveToPrevious = (opportunityId: string) => {
    const currentIndex = MEDICAL_PIPELINE_STAGES.findIndex(s => s.id === stage.id);
    if (currentIndex > 0) {
      const previousStage = MEDICAL_PIPELINE_STAGES[currentIndex - 1];
      onMoveOpportunity(opportunityId, previousStage.id);
    }
  };

  const handleMoveToNext = (opportunityId: string) => {
    const currentIndex = MEDICAL_PIPELINE_STAGES.findIndex(s => s.id === stage.id);
    if (currentIndex < MEDICAL_PIPELINE_STAGES.length - 1) {
      const nextStage = MEDICAL_PIPELINE_STAGES[currentIndex + 1];
      onMoveOpportunity(opportunityId, nextStage.id);
    }
  };

  const columnWidth = responsive.utils.getValue({
    mobile: 'w-[280px] min-w-[280px]',
    tablet: 'w-[300px] min-w-[300px]',
    desktop: 'w-[320px] min-w-[320px]'
  });

  return (
    <div className={cn(
      "flex flex-col h-full bg-muted/20 rounded-lg border-2 border-dashed border-border/50",
      columnWidth,
      responsive.utils.getClasses({
        mobile: "pipeline-column-mobile",
        tablet: "pipeline-column-tablet",
        desktop: "pipeline-column-desktop"
      })
    )}>
      {/* Column Header */}
      <Card className="flex-shrink-0 m-2 border-l-4" style={{ borderLeftColor: stage.color }}>
        <CardHeader className={cn("pb-3", responsive.config.spacing.cardPadding)}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "font-medium",
              responsive.config.typography.textSize
            )}>
              {stage.title}
            </CardTitle>
            <Badge variant="secondary" className={cn("text-xs", getStageColorClass(stage.color))}>
              {opportunities.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Value</span>
            <span className="font-medium">${totalValue.toLocaleString()}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 px-2 pb-2">
        <ScrollArea className="h-full w-full">
          <SortableContext items={opportunities.map(o => o.id)} strategy={verticalListSortingStrategy}>
            <div className={cn("space-y-2 pr-3 pb-2", {
              "pipeline-virtual": responsive.pipeline.performance.useVirtualization
            })}>
              {opportunities.slice(0, responsive.pipeline.performance.maxVisibleCards).map(opportunity => (
                <div key={opportunity.id} className={responsive.pipeline.performance.useVirtualization ? "pipeline-lazy" : ""}>
                  <EnhancedCompactOpportunityCard
                    opportunity={opportunity}
                    onMoveToPrevious={handleMoveToPrevious}
                    onMoveToNext={handleMoveToNext}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
          
          {opportunities.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Drop opportunities here
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export function OptimizedKanbanBoard({
  opportunities,
  stages,
  onMoveOpportunity,
  className
}: OptimizedKanbanBoardProps) {
  const responsive = usePipelineResponsive();
  
  // Group opportunities by stage
  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {};
    
    stages.forEach(stage => {
      grouped[stage.id] = opportunities.filter(opp => opp.pipeline_stage === stage.id);
    });
    
    return grouped;
  }, [opportunities, stages]);

  const containerClasses = responsive.utils.getClasses({
    mobile: "pipeline-mobile",
    tablet: "pipeline-tablet",
    desktop: "pipeline-desktop"
  });

  const scrollContainerWidth = useMemo(() => {
    const columnWidth = responsive.pipeline.kanban.columnWidth || 320;
    const gap = responsive.device.isMobile ? 8 : 16;
    const calculatedWidth = stages.length * (columnWidth + gap) + 100;
    // Force minimum width to exceed viewport to enable horizontal scrolling
    const viewportWidth = window.innerWidth;
    return Math.max(calculatedWidth, viewportWidth + 400);
  }, [stages.length, responsive]);

  return (
    <div className={cn("w-full h-full overflow-x-auto overflow-y-hidden", className)}>
      <PipelineDragProvider
        opportunities={opportunities}
        stages={stages}
        onMoveOpportunity={onMoveOpportunity}
      >
        <div className="relative h-full">
          {/* Enhanced scroll container */}
          <div 
            className={cn(
              "flex h-full min-h-[500px] gap-4 p-2",
              containerClasses,
              {
                "pipeline-momentum-scroll": responsive.pipeline.touch.snapBehavior
              }
            )}
            style={{
              width: `${scrollContainerWidth}px`,
              minWidth: `${scrollContainerWidth}px`
            }}
          >
            {stages.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                opportunities={opportunitiesByStage[stage.id] || []}
                onMoveOpportunity={onMoveOpportunity}
                responsive={responsive}
              />
            ))}
          </div>
        </div>
      </PipelineDragProvider>
    </div>
  );
}