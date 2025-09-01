import { useCallback, useMemo, useState } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { PipelineStageNode } from "@/components/pipeline/PipelineStageNode";
import { AddOpportunityModal } from "@/components/pipeline/AddOpportunityModal";
import { MobilePipeline } from "@/components/pipeline/MobilePipeline";
import { usePipelineStages, usePipelineOpportunities, usePipelineStats, usePipelineMutations } from "@/hooks/usePipeline";
import { useIsMobile, useDeviceType } from "@/hooks/use-breakpoints";

const nodeTypes = {
  stageNode: PipelineStageNode,
};

export default function Opportunities() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { data: opportunities = [], isLoading: opportunitiesLoading } = usePipelineOpportunities();
  const { stats, stageStats } = usePipelineStats();
  const { updateOpportunityStage } = usePipelineMutations();
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();

  const { nodes, edges } = useMemo(() => {
    if (!stages.length) return { nodes: [], edges: [] };

    const stageNodes: Node[] = stages.map((stage, index) => ({
      id: `stage-${stage.id}`,
      type: "stageNode",
      position: isMobile 
        ? { x: 50, y: index * 300 } // Vertical layout for mobile
        : { x: index * 350, y: 100 }, // Horizontal layout for desktop
      data: {
        stage,
        opportunities,
        allStages: stages,
        onMoveOpportunity: (opportunityId: string, targetStageId: string) => {
          updateOpportunityStage.mutate({ id: opportunityId, stageId: targetStageId });
        },
        isMobile,
      },
    }));

    const stageEdges: Edge[] = stages.slice(0, -1).map((stage, index) => ({
      id: `edge-${stage.id}-${stages[index + 1].id}`,
      source: `stage-${stage.id}`,
      target: `stage-${stages[index + 1].id}`,
      type: "smoothstep",
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "hsl(var(--border))",
      },
      style: { 
        stroke: "hsl(var(--border))",
        strokeWidth: isMobile ? 3 : 2, // Thicker lines for mobile
      },
    }));

    return { nodes: stageNodes, edges: stageEdges };
  }, [stages, opportunities, updateOpportunityStage, isMobile]);

  if (stagesLoading || opportunitiesLoading) {
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
        <div className="space-y-4 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Medical Pipeline</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Track patients through your medical pipeline
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Opportunity
            </Button>
          </div>

          {/* Pipeline Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalOpportunities} opportunities
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(stats.averageDealSize).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Per opportunity
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeContacts}</div>
                <p className="text-xs text-muted-foreground">
                  Unique prospects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalOpportunities > 0 
                    ? Math.round((stageStats.find(s => s.position === 7)?.count || 0) / stats.totalOpportunities * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  To payment complete
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Flow */}
          <Card className="p-0 overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Medical Pipeline Flow</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-4" : "p-0"}>
              {isMobile ? (
                <MobilePipeline 
                  opportunities={opportunities}
                  onMoveOpportunity={(opportunityId: string, targetStageId: string) => {
                    updateOpportunityStage.mutate({ id: opportunityId, stageId: targetStageId });
                  }}
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "600px",
                  minHeight: "500px"
                }}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ 
                      padding: 50,
                      includeHiddenNodes: false
                    }}
                    minZoom={0.5}
                    maxZoom={1.5}
                    defaultViewport={{ 
                      x: 0, 
                      y: 0, 
                      zoom: 0.8 
                    }}
                    proOptions={{ hideAttribution: true }}
                    panOnScroll={true}
                    zoomOnScroll={true}
                    selectionOnDrag={false}
                  >
                    <Controls 
                      position="bottom-right"
                      showZoom={true}
                      showFitView={true}
                      showInteractive={false}
                    />
                    <Background 
                      color="hsl(var(--muted-foreground))" 
                      gap={16}
                      size={1}
                    />
                  </ReactFlow>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stage Summary */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Stage Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
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
                    <div key={stage.id} className="text-center space-y-2">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getStageColorClass(stage.color)} mx-auto flex items-center justify-center text-white font-bold text-sm sm:text-lg`}>
                        {stage.count}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium leading-tight">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${stage.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
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