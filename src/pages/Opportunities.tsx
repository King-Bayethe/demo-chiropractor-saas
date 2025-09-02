import { useState } from "react";
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { AddOpportunityModal } from "@/components/pipeline/AddOpportunityModal";
import { MobilePipeline } from "@/components/pipeline/MobilePipeline";
import { KanbanPipelineBoard } from "@/components/opportunities/KanbanPipelineBoard";
import { useOpportunities, MEDICAL_PIPELINE_STAGES } from "@/hooks/useOpportunities";
import { useIsMobile } from "@/hooks/use-breakpoints";

export default function Opportunities() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { opportunities, loading, updateOpportunityStage } = useOpportunities();
  const isMobile = useIsMobile();

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

          {/* Pipeline Board */}
          <Card className="p-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Medical Pipeline Board</CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? "p-4" : "p-6"} h-[700px] overflow-hidden`}>
              {isMobile ? (
                <MobilePipeline 
                  opportunities={opportunities}
                  onMoveOpportunity={handleMoveOpportunity}
                />
              ) : (
                <KanbanPipelineBoard
                  opportunities={opportunities}
                  stages={stages}
                  onMoveOpportunity={handleMoveOpportunity}
                />
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