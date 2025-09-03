import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Keyboard,
  MoreVertical,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdvancedResponsive } from '@/hooks/useAdvancedResponsive';
import { useKeyboardShortcuts, usePipelineKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSwipeGestures, usePullToRefresh } from '@/hooks/useSwipeGestures';
import { OptimizedKanbanBoard } from '@/components/opportunities/OptimizedKanbanBoard';
import { TabsPipelineBoard } from '@/components/opportunities/TabsPipelineBoard';
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
  const responsive = useAdvancedResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'tabs' | 'list'>('kanban');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());

  // Filter opportunities based on search
  const filteredOpportunities = React.useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    
    const query = searchQuery.toLowerCase();
    return opportunities.filter(opp => 
      opp.patient_name?.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.status?.toLowerCase().includes(query)
    );
  }, [opportunities, searchQuery]);

  // Keyboard shortcuts
  const toggleView = useCallback(() => {
    setViewMode(prev => prev === 'kanban' ? 'tabs' : 'kanban');
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const handleStageNavigation = useCallback((direction: 'left' | 'right') => {
    setCurrentStageIndex(prev => {
      if (direction === 'left') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(stages.length - 1, prev + 1);
      }
    });
  }, [stages.length]);

  usePipelineKeyboardShortcuts(
    onAddOpportunity,
    onRefresh,
    toggleView,
    focusSearch
  );

  // Additional keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'f11',
      action: toggleFullscreen,
      description: 'Toggle fullscreen mode'
    },
    {
      key: '?',
      modifiers: ['shift'],
      action: () => setShowKeyboardHelp(prev => !prev),
      description: 'Show keyboard shortcuts'
    },
    {
      key: 'Escape',
      action: () => {
        setShowKeyboardHelp(false);
        setSelectedOpportunities(new Set());
      },
      description: 'Close dialogs and clear selection'
    },
    {
      key: 'a',
      modifiers: ['ctrl'],
      action: () => {
        const allIds = new Set(filteredOpportunities.map(opp => opp.id));
        setSelectedOpportunities(allIds);
      },
      description: 'Select all opportunities'
    }
  ]);

  // Swipe gestures for mobile
  useSwipeGestures(
    containerRef,
    {
      onSwipeLeft: () => handleStageNavigation('right'),
      onSwipeRight: () => handleStageNavigation('left'),
    },
    { enableHaptic: true }
  );

  // Pull to refresh
  const { isRefreshing } = usePullToRefresh(
    containerRef,
    onRefresh,
    { enableHaptic: true }
  );

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedView = responsive.loadPreference('pipelineView', 'kanban');
    setViewMode(savedView);
  }, [responsive]);

  // Save view preference
  useEffect(() => {
    responsive.savePreference('pipelineView', viewMode);
  }, [viewMode, responsive]);

  const renderBoard = () => {
    const commonProps = {
      opportunities: filteredOpportunities,
      stages,
      onMoveOpportunity,
      className: cn(
        responsive.a11y.getFocusClasses(),
        responsive.a11y.getHighContrastClasses()
      )
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
      className={cn(
        "relative w-full h-full bg-background",
        isFullscreen && "fixed inset-0 z-50 p-4",
        responsive.a11y.shouldReduceMotion() ? "" : "transition-all duration-300"
      )}
      role="region"
      aria-label="Pipeline Board"
    >
      {/* Enhanced Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className={responsive.config.typography.headingSize}>
              Medical Pipeline Board
              {isRefreshing && (
                <RefreshCw className="inline ml-2 h-4 w-4 animate-spin" />
              )}
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
                    <TooltipContent>Kanban View (Ctrl+V)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tabs')}
                        className="rounded-none border-x"
                        aria-label="Tabs view"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tabs View (Ctrl+V)</TooltipContent>
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

              {/* Action Buttons */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKeyboardHelp(true)}
                      aria-label="Show keyboard shortcuts"
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fullscreen (F11)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Results Info */}
          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              Found {filteredOpportunities.length} of {opportunities.length} opportunities
            </div>
          )}

          {/* Selection Info */}
          {selectedOpportunities.size > 0 && (
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
              <span className="text-sm">
                {selectedOpportunities.size} opportunities selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOpportunities(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Pipeline Board Content */}
      <Card className="flex-1 min-h-0">
        <CardContent 
          className="p-4 h-full overflow-hidden"
          style={{
            fontSize: `${responsive.fontScale}rem`,
            contain: responsive.advanced.useContainerQueries ? 'layout size style' : 'none'
          }}
        >
          {renderBoard()}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowKeyboardHelp(false)}
        >
          <Card className="max-w-lg w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Navigation:</strong>
                  <div>↑↓ - Focus opportunity</div>
                  <div>←→ - Move opportunity</div>
                  <div>Enter - Open opportunity</div>
                  <div>Esc - Clear focus</div>
                </div>
                <div>
                  <strong>Actions:</strong>
                  <div>Ctrl+N - New opportunity</div>
                  <div>Ctrl+R - Refresh</div>
                  <div>Ctrl+V - Toggle view</div>
                  <div>Ctrl+F - Search</div>
                  <div>Ctrl+A - Select all</div>
                  <div>F11 - Fullscreen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Indicator */}
      {responsive.performanceUtils.getOptimizationLevel() !== 'low' && (
        <div className="fixed bottom-4 right-4 z-40">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              responsive.performance.frameRate < 30 ? "border-red-500 text-red-600" :
              responsive.performance.frameRate < 45 ? "border-yellow-500 text-yellow-600" :
              "border-green-500 text-green-600"
            )}
          >
            {Math.round(responsive.performance.frameRate)} FPS
          </Badge>
        </div>
      )}
    </div>
  );
}