import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { OptimizedKanbanBoard } from '@/components/opportunities/OptimizedKanbanBoard';
import { TabsPipelineBoard } from '@/components/opportunities/TabsPipelineBoard';
import { useUnifiedResponsive } from '@/hooks/useUnifiedResponsive';
import { cn } from '@/lib/utils';

interface EnhancedPipelineBoardProps {
  opportunities: any[];
  stages: any[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
  onRefresh: () => Promise<void> | void;
  onAddOpportunity: () => void;
}

export function EnhancedPipelineBoard({
  opportunities,
  stages,
  onMoveOpportunity,
  onRefresh,
  onAddOpportunity
}: EnhancedPipelineBoardProps) {
  const responsive = useUnifiedResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'tabs'>('kanban');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Filter opportunities based on search
  const filteredOpportunities = React.useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    
    const query = searchQuery.toLowerCase();
    return opportunities.filter(opp => 
      opp.patient_name?.toLowerCase().includes(query) ||
      opp.name?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.status?.toLowerCase().includes(query)
    );
  }, [opportunities, searchQuery]);

  const handleStageNavigation = useCallback((direction: 'left' | 'right') => {
    setCurrentStageIndex(prev => {
      if (direction === 'left') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(stages.length - 1, prev + 1);
      }
    });
  }, [stages.length]);

  // Load saved view preference
  useEffect(() => {
    try {
      const savedView = localStorage.getItem('pipeline-view') as 'kanban' | 'tabs';
      if (savedView && (savedView === 'kanban' || savedView === 'tabs')) {
        setViewMode(savedView);
      }
    } catch (error) {
      console.warn('Failed to load view preference:', error);
    }
  }, []);

  // Save view preference
  useEffect(() => {
    try {
      localStorage.setItem('pipeline-view', viewMode);
    } catch (error) {
      console.warn('Failed to save view preference:', error);
    }
  }, [viewMode]);

  const renderBoard = () => {
    const commonProps = {
      opportunities: filteredOpportunities,
      stages,
      onMoveOpportunity,
    };

    switch (viewMode) {
      case 'tabs':
        return <TabsPipelineBoard {...commonProps} />;
      case 'kanban':
      default:
        return <OptimizedKanbanBoard {...commonProps} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex flex-col bg-background"
      role="region"
      aria-label="Pipeline Board"
    >
      {/* Enhanced Header */}
      <Card className="mb-4 flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className={responsive.config.typography.headingSize}>
              Medical Pipeline Board
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  aria-label="Search opportunities"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                        className="rounded-r-none"
                        aria-label="Kanban view"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kanban View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tabs')}
                        className="rounded-l-none"
                        aria-label="Tabs view"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tabs View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Stage Navigation (Mobile) */}
              {responsive.device.isMobile && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStageNavigation('left')}
                    disabled={currentStageIndex === 0}
                    aria-label="Previous stage"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="min-w-[60px] text-center">
                    {currentStageIndex + 1} / {stages.length}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStageNavigation('right')}
                    disabled={currentStageIndex === stages.length - 1}
                    aria-label="Next stage"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Results Info */}
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              Found {filteredOpportunities.length} of {opportunities.length} opportunities
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Pipeline Board Content */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <Card className="h-full min-h-[600px]">
          <CardContent className="p-4 h-full">
            {renderBoard()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}