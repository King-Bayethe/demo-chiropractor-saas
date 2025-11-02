import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Target } from "lucide-react";
import { KanbanOpportunityCard } from "@/components/pipeline/KanbanOpportunityCard";
import { usePipelineStages, usePipelineOpportunities, usePipelineStats, usePipelineMutations } from "@/hooks/usePipeline";

export default function Opportunities() {
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { data: opportunities = [], isLoading: opportunitiesLoading } = usePipelineOpportunities();
  const { stats, stageStats } = usePipelineStats();
  const { updateOpportunityStage } = usePipelineMutations();

  const getStageColor = (color: string) => {
    const colorMap: Record<string, string> = {
      '#ef4444': 'bg-red-500 border-red-200',
      '#f97316': 'bg-orange-500 border-orange-200', 
      '#eab308': 'bg-yellow-500 border-yellow-200',
      '#3b82f6': 'bg-blue-500 border-blue-200',
      '#8b5cf6': 'bg-violet-500 border-violet-200',
      '#06b6d4': 'bg-cyan-500 border-cyan-200',
      '#10b981': 'bg-emerald-500 border-emerald-200',
    };
    return colorMap[color] || 'bg-gray-500 border-gray-200';
  };

  const handleMoveOpportunity = (opportunityId: string, direction: 'left' | 'right') => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const currentStageIndex = stages.findIndex(stage => stage.id === opportunity.pipeline_stage);
    if (currentStageIndex === -1) return;

    let targetStageIndex;
    if (direction === 'left' && currentStageIndex > 0) {
      targetStageIndex = currentStageIndex - 1;
    } else if (direction === 'right' && currentStageIndex < stages.length - 1) {
      targetStageIndex = currentStageIndex + 1;
    } else {
      return;
    }

    const targetStage = stages[targetStageIndex];
    updateOpportunityStage.mutate({ id: opportunityId, stageId: targetStage.id });
  };

  if (stagesLoading || opportunitiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading pipeline...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Patient Opportunities</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track patient journey from initial contact to completed care
            </p>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalOpportunities} patient opportunities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Patient Value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(stats.averageDealSize).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime value estimate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prospects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContacts}</div>
              <p className="text-xs text-muted-foreground">
                Potential patients
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
                To completed care
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Pipeline Board */}
        <div className="bg-gray-50 min-h-[600px] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Patient Journey Pipeline</h2>
          
          <div className="flex gap-6 overflow-x-auto pb-4">
            {stages.map((stage, stageIndex) => {
              const stageOpportunities = opportunities.filter(opp => opp.pipeline_stage === stage.id);
              const totalValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{stage.title}</h3>
                        <div className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                          {stageOpportunities.length}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Total Value</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opportunities Column */}
                  <div className="space-y-0 max-h-[500px] overflow-y-auto">
                    {stageOpportunities.map((opportunity) => (
                      <KanbanOpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        canMoveLeft={stageIndex > 0}
                        canMoveRight={stageIndex < stages.length - 1}
                        onMoveLeft={() => handleMoveOpportunity(opportunity.id, 'left')}
                        onMoveRight={() => handleMoveOpportunity(opportunity.id, 'right')}
                      />
                    ))}
                    
                    {stageOpportunities.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No opportunities in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Summary */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Stage Summary</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
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
                    <div className={`w-12 h-12 rounded-full ${getStageColorClass(stage.color)} mx-auto flex items-center justify-center text-white font-bold text-lg`}>
                      {stage.count}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stage.name}</p>
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
    </DashboardLayout>
  );
}