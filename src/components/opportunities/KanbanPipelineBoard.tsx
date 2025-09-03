import React, { useState, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PipelineDragProvider } from '@/components/pipeline/PipelineDragProvider';
import { MedicalOpportunityCard } from './MedicalOpportunityCard';
import { CompactOpportunityCard } from './CompactOpportunityCard';
import { Opportunity, MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Custom hook for responsive column sizing
const useResponsiveColumns = () => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Determine column configuration based on screen width
  const getColumnConfig = () => {
    const { width } = screenSize;
    
    if (width < 640) {
      // Small mobile: Extra compact
      return {
        width: 'w-56 min-w-56 max-w-56',
        widthPx: 224,
        gap: 'gap-2',
        containerPadding: 'px-2'
      };
    } else if (width < 768) {
      // Mobile: Compact columns
      return {
        width: 'w-60 min-w-60 max-w-60',
        widthPx: 240,
        gap: 'gap-2',
        containerPadding: 'px-2'
      };
    } else if (width < 1024) {
      // Tablet: Medium columns
      return {
        width: 'w-64 min-w-64 max-w-64',
        widthPx: 256,
        gap: 'gap-3',
        containerPadding: 'px-3'
      };
    } else if (width < 1280) {
      // Small desktop: Balanced columns
      return {
        width: 'w-72 min-w-72 max-w-72',
        widthPx: 288,
        gap: 'gap-3',
        containerPadding: 'px-4'
      };
    } else if (width < 1920) {
      // Large desktop: Comfortable columns
      return {
        width: 'w-80 min-w-80 max-w-80',
        widthPx: 320,
        gap: 'gap-4',
        containerPadding: 'px-4'
      };
    } else {
      // Ultra-wide: Maximum columns
      return {
        width: 'w-96 min-w-96 max-w-96',
        widthPx: 384,
        gap: 'gap-4',
        containerPadding: 'px-6'
      };
    }
  };
  
  return getColumnConfig();
};

interface KanbanPipelineBoardProps {
  opportunities: Opportunity[];
  stages: any[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
  className?: string;
  compact?: boolean;
}

interface StageColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  opportunities: Opportunity[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
}

function StageColumn({ stage, opportunities, onMoveOpportunity }: StageColumnProps) {
  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const columnConfig = useResponsiveColumns();
  
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

  return (
    <div className={cn("flex flex-col h-full bg-muted/20 rounded-lg border-2 border-dashed border-border/50", columnConfig.width)}>
      {/* Column Header */}
      <Card className="flex-shrink-0 m-2 border-l-4" style={{ borderLeftColor: stage.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
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
            <div className="space-y-2 pr-3 pb-2">
              {opportunities.map(opportunity => (
                <CompactOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onMoveToPrevious={handleMoveToPrevious}
                  onMoveToNext={handleMoveToNext}
                />
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

export function KanbanPipelineBoard({
  opportunities,
  stages,
  onMoveOpportunity,
  className,
  compact = false
}: KanbanPipelineBoardProps) {
  const isMobile = useIsMobile();
  const columnConfig = useResponsiveColumns();
  
  // Group opportunities by stage
  const opportunitiesByStage = React.useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {};
    
    stages.forEach(stage => {
      grouped[stage.id] = opportunities.filter(opp => opp.pipeline_stage === stage.id);
    });
    
    return grouped;
  }, [opportunities, stages]);

  return (
    <div className={cn("w-full h-full", className)}>
      <PipelineDragProvider
        opportunities={opportunities}
        stages={stages}
        onMoveOpportunity={onMoveOpportunity}
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Horizontally scrollable container */}
          <div 
            className={cn(
              "flex h-full overflow-x-auto overflow-y-hidden",
              columnConfig.gap,
              columnConfig.containerPadding,
              "pb-4" // Add padding for better scrollbar appearance
            )}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
            }}
          >
            <div 
              className="flex gap-inherit"
              style={{
                minWidth: `${stages.length * (columnConfig.widthPx + 16)}px`
              }}
            >
              {stages.map(stage => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  opportunities={opportunitiesByStage[stage.id] || []}
                  onMoveOpportunity={onMoveOpportunity}
                />
              ))}
            </div>
          </div>
          
          {/* Scroll indicators */}
          <div className="pointer-events-none absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-background to-transparent opacity-50 z-10" />
          <div className="pointer-events-none absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-background to-transparent opacity-50 z-10" />
        </div>
      </PipelineDragProvider>
    </div>
  );
}