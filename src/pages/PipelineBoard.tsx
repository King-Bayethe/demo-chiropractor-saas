import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { PipelineToolbar } from "@/components/kanban/PipelineToolbar";
import { PipelineFilters } from "@/components/kanban/PipelineFilters";
import { PipelineStats } from "@/components/kanban/PipelineStats";
import { usePipelines, usePipelineStages } from "@/hooks/usePipelines";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function PipelineBoard() {
  const { pipelines, loading: pipelinesLoading } = usePipelines();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const { stages, loading: stagesLoading } = usePipelineStages(selectedPipeline);
  const { opportunities, loading: opportunitiesLoading, updateOpportunityStage } = useOpportunities();

  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    valueRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Initialize selected pipeline
  useEffect(() => {
    if (!selectedPipeline && pipelines.length > 0) {
      const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
      setSelectedPipeline(defaultPipeline.id);
    }
  }, [pipelines, selectedPipeline]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Filter by pipeline
      if (selectedPipeline && opp.pipeline_id !== selectedPipeline) {
        return false;
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = opp.patient_name?.toLowerCase().includes(searchLower);
        const matchesEmail = opp.patient_email?.toLowerCase().includes(searchLower);
        const matchesPhone = opp.patient_phone?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // Filter by priority
      if (filters.priority !== 'all' && opp.priority !== filters.priority) {
        return false;
      }

      // Filter by value range
      if (filters.valueRange !== 'all') {
        const value = opp.estimated_value || 0;
        const [min, max] = filters.valueRange.split('-').map(Number);
        if (max) {
          if (value < min || value > max) return false;
        } else {
          if (value < min) return false;
        }
      }

      return true;
    });
  }, [opportunities, selectedPipeline, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOpportunities = filteredOpportunities.length;
    const totalValue = filteredOpportunities.reduce(
      (sum, opp) => sum + (opp.estimated_value || 0),
      0
    );
    const averageDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    const activeContacts = new Set(
      filteredOpportunities.map(opp => opp.patient_name || 'Unknown')
    ).size;

    return {
      totalOpportunities,
      totalValue,
      averageDealSize,
      activeContacts,
    };
  }, [filteredOpportunities]);

  // Handle moving opportunities between stages
  const handleMoveOpportunity = (opportunityId: string, targetStageId: string) => {
    updateOpportunityStage(opportunityId, targetStageId);
  };

  const isLoading = pipelinesLoading || stagesLoading || opportunitiesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Board</h1>
          <p className="text-muted-foreground mt-1">
            Manage your opportunities through each stage
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : pipelines.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No pipelines found. Create a pipeline to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Toolbar */}
            <PipelineToolbar
              pipelines={pipelines}
              selectedPipeline={selectedPipeline}
              onPipelineChange={setSelectedPipeline}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {/* Filters */}
            {showFilters && (
              <PipelineFilters
                search={filters.search}
                priority={filters.priority}
                valueRange={filters.valueRange}
                onSearchChange={(value) => setFilters({ ...filters, search: value })}
                onPriorityChange={(value) => setFilters({ ...filters, priority: value })}
                onValueRangeChange={(value) => setFilters({ ...filters, valueRange: value })}
              />
            )}

            {/* Statistics */}
            <PipelineStats
              totalOpportunities={stats.totalOpportunities}
              totalValue={stats.totalValue}
              averageDealSize={stats.averageDealSize}
              activeContacts={stats.activeContacts}
            />

            {/* Kanban Board */}
            {stages.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No stages found for this pipeline. Add stages to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <KanbanBoard
                stages={stages}
                opportunities={filteredOpportunities}
                onMoveOpportunity={handleMoveOpportunity}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
