import { useState, useEffect } from "react";
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { AddOpportunityModal } from "@/components/pipeline/AddOpportunityModal";
import { TabsPipelineBoard } from "@/components/opportunities/TabsPipelineBoard";
import { KanbanPipelineBoard } from "@/components/opportunities/KanbanPipelineBoard";
import { PipelineViewToggle, PipelineViewType } from "@/components/opportunities/PipelineViewToggle";
import { useOpportunities, MEDICAL_PIPELINE_STAGES } from "@/hooks/useOpportunities";
import { useIsMobile } from "@/hooks/use-breakpoints";
import { useAdaptiveLayout } from "@/hooks/useViewportResize";
import { cn } from "@/lib/utils";

export default function Opportunities() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [pipelineView, setPipelineView] = useState<PipelineViewType>('tabs');
  const { opportunities, loading, updateOpportunityStage } = useOpportunities();
  const isMobile = useIsMobile();
  const layout = useAdaptiveLayout();

  // Process stages
  const stages = MEDICAL_PIPELINE_STAGES.map(stage => ({
    ...stage,
    position: MEDICAL_PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1,
  }));

  // Calculate stats
  const stats = {
    totalOpportunities: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0),
    averageDealSize: opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0) / opportunities.length : 0,
    activeContacts: new Set(opportunities.map(opp => opp.patient_name || 'Unknown')).size,
  };

  const stageStats = MEDICAL_PIPELINE_STAGES.map((stage, index) => {
    const stageOpportunities = opportunities.filter(opp => opp.pipeline_stage === stage.id);
    const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    
    return {
      id: stage.id,
      name: stage.title,
      color: stage.color.replace('bg-', '').replace('-500', ''),
      count: stageOpportunities.length,
      value: stageValue,
      position: index + 1,
    };
  });

  const handleMoveOpportunity = (opportunityId: string, targetStageId: string) => {
    updateOpportunityStage(opportunityId, targetStageId);
  };

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('pipeline-view') as PipelineViewType;
    if (savedView && (savedView === 'tabs' || savedView === 'kanban')) {
      setPipelineView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (view: PipelineViewType) => {
    setPipelineView(view);
    localStorage.setItem('pipeline-view', view);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading pipeline...</div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className={cn(
          "h-full overflow-auto",
          layout.shouldReduceSpacing ? "space-y-2 p-2" : "space-y-3 p-3 sm:p-4"
        )}>
          {/* Header */}
          <div className={cn(
            "flex justify-between gap-2",
            layout.shouldUseCompactLayout ? "flex-col" : "flex-col sm:flex-row sm:items-center"
          )}>
            <div>
              <h1 className={cn(
                "font-bold tracking-tight",
                layout.shouldUseCompactLayout ? "text-lg" : "text-xl sm:text-2xl"
              )}>
                Medical Pipeline
              </h1>
              <p className={cn(
                "text-muted-foreground",
                layout.shouldUseCompactLayout ? "text-xs" : "text-sm sm:text-base"
              )}>
                Track patients through your medical pipeline
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PipelineViewToggle 
                view={pipelineView}
                onViewChange={handleViewChange}
              />
              <Button 
                onClick={() => setShowAddModal(true)} 
                className={cn(
                  "flex items-center gap-2",
                  layout.shouldUseCompactLayout ? "h-8 text-xs" : "w-full sm:w-auto"
                )}
                size={layout.shouldUseCompactLayout ? "sm" : "default"}
              >
                <Plus className={cn(layout.shouldUseCompactLayout ? "h-3 w-3" : "h-4 w-4")} />
                Add Opportunity
              </Button>
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className={cn(
            "grid gap-2",
            layout.shouldUseCompactLayout ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4",
            layout.shouldReduceSpacing ? "gap-1.5" : "gap-2 sm:gap-3"
          )}>
            <Card className={cn(layout.shouldUseCompactLayout ? "p-2" : "p-3")}>
              <CardHeader className={cn(
                "flex flex-row items-center justify-between space-y-0",
                layout.shouldUseCompactLayout ? "pb-0.5" : "pb-1"
              )}>
                <CardTitle className={cn(
                  "font-medium",
                  layout.shouldUseCompactLayout ? "text-xs" : "text-xs"
                )}>
                  Total Pipeline
                </CardTitle>
                <DollarSign className={cn(
                  "text-muted-foreground",
                  layout.shouldUseCompactLayout ? "h-2.5 w-2.5" : "h-3 w-3"
                )} />
              </CardHeader>
              <CardContent className="p-0">
                <div className={cn(
                  "font-bold",
                  layout.shouldUseCompactLayout ? "text-sm" : "text-lg"
                )}>
                  ${stats.totalValue.toLocaleString()}
                </div>
                <p className={cn(
                  "text-muted-foreground",
                  layout.shouldUseCompactLayout ? "text-xs" : "text-xs"
                )}>
                  {stats.totalOpportunities} opportunities
                </p>
              </CardContent>
            </Card>
            
            {/* Show only most important stats in compact mode */}
            {layout.shouldUseCompactLayout ? (
              <Card className="p-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5">
                  <CardTitle className="text-xs font-medium">Conversion</CardTitle>
                  <TrendingUp className="h-2.5 w-2.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-sm font-bold">
                    {stats.totalOpportunities > 0 
                      ? Math.round((stageStats.find(s => s.position === 6)?.count || 0) / stats.totalOpportunities * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Avg Deal Size</CardTitle>
                    <Target className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-lg font-bold">${Math.round(stats.averageDealSize).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Per opportunity
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Active Contacts</CardTitle>
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-lg font-bold">{stats.activeContacts}</div>
                    <p className="text-xs text-muted-foreground">
                      Unique prospects
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="p-3">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-lg font-bold">
                      {stats.totalOpportunities > 0 
                        ? Math.round((stageStats.find(s => s.position === 6)?.count || 0) / stats.totalOpportunities * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To completion
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Stage Summary */}
          <Card>
            <CardHeader className={cn(
              layout.shouldUseCompactLayout ? "p-2" : "p-3 sm:p-4"
            )}>
              <CardTitle className={cn(
                layout.shouldUseCompactLayout ? "text-sm" : "text-sm sm:text-base"
              )}>
                Stage Summary
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(
              "pt-0",
              layout.shouldUseCompactLayout ? "p-2" : "p-3 sm:p-4"
            )}>
              <div className={cn(
                "grid gap-2",
                layout.shouldUseCompactLayout 
                  ? "grid-cols-3 gap-1.5" 
                  : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3"
              )}>
                {stageStats.map((stage) => {
                  const getStageColorClass = (color: string) => {
                    const colorMap: Record<string, string> = {
                      '#ef4444': 'bg-red-500',
                      '#f97316': 'bg-orange-500', 
                      '#eab308': 'bg-yellow-500',
                      '#3b82f6': 'bg-blue-500',
                      '#8b5cf6': 'bg-violet-500',
                      '#06b6d4': 'bg-cyan-500',
                      '#10b981': 'bg-emerald-500',
                    };
                    return colorMap[color] || 'bg-gray-500';
                  };

                  return (
                    <div key={stage.id} className={cn(
                      "text-center",
                      layout.shouldUseCompactLayout ? "space-y-0.5" : "space-y-1"
                    )}>
                      <div className={cn(
                        "rounded-full mx-auto flex items-center justify-center text-white font-bold",
                        layout.shouldUseCompactLayout 
                          ? "w-6 h-6 text-xs" 
                          : "w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm",
                        getStageColorClass(stage.color)
                      )}>
                        {stage.count}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium leading-tight",
                          layout.shouldUseCompactLayout ? "text-xs" : "text-xs"
                        )}>
                          {layout.shouldUseCompactLayout 
                            ? stage.name.split(' ')[0] // Show only first word in compact mode
                            : stage.name
                          }
                        </p>
                        {!layout.shouldUseCompactLayout && (
                          <p className="text-xs text-muted-foreground">
                            ${stage.value.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Board */}
          <Card className="p-0 min-h-0 flex flex-col">
            <CardHeader className={cn(
              "flex-shrink-0",
              layout.shouldUseCompactLayout ? "p-2" : "p-3 sm:p-4"
            )}>
              <CardTitle className={cn(
                layout.shouldUseCompactLayout ? "text-sm" : "text-sm sm:text-base"
              )}>
                Medical Pipeline Board
              </CardTitle>
            </CardHeader>
            <CardContent 
              className={cn(
                "flex-1 min-h-0 relative",
                layout.shouldUseCompactLayout ? "p-1" : isMobile ? "p-2" : "p-3"
              )}
            >
              <div 
                className="w-full h-full overflow-auto"
                style={{ 
                  minHeight: layout.shouldUseCompactLayout ? '300px' : '400px',
                  maxHeight: '80vh'
                }}
              >
                {pipelineView === 'tabs' ? (
                  <TabsPipelineBoard
                    opportunities={opportunities}
                    stages={stages}
                    onMoveOpportunity={handleMoveOpportunity}
                  />
                ) : (
                  <KanbanPipelineBoard
                    opportunities={opportunities}
                    stages={stages}
                    onMoveOpportunity={handleMoveOpportunity}
                    compact={layout.shouldUseCompactLayout}
                  />
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <AddOpportunityModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal}
        />
      </Layout>
    </AuthGuard>
  );
}