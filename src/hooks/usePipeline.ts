import { useMemo } from 'react';
import { useOpportunities } from './useOpportunities';
import { usePipelineStages as useStages } from './usePipelines';

export function usePipelineStages(pipelineId: string | null = null) {
  const { stages: dbStages, loading } = useStages(pipelineId);
  
  const stages = useMemo(() => {
    return dbStages.map(stage => ({
      id: stage.name.toLowerCase().replace(/\s+/g, '-'),
      title: stage.name,
      color: stage.color,
      description: stage.description || '',
      position: stage.position,
    }));
  }, [dbStages]);

  return {
    data: stages,
    isLoading: loading,
  };
}

export function usePipelineOpportunities() {
  const { opportunities, loading } = useOpportunities();
  
  return {
    data: opportunities,
    isLoading: loading,
  };
}

export function usePipelineStats(pipelineId: string | null = null) {
  const { opportunities } = useOpportunities();
  const { stages } = useStages(pipelineId);
  
  const filteredOpportunities = useMemo(() => {
    if (!pipelineId) return opportunities;
    return opportunities.filter(opp => opp.pipeline_id === pipelineId);
  }, [opportunities, pipelineId]);
  
  const stats = useMemo(() => {
    const totalOpportunities = filteredOpportunities.length;
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    const averageDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    const activeContacts = new Set(filteredOpportunities.map(opp => opp.patient_name || 'Unknown')).size;
    
    return {
      totalOpportunities,
      totalValue,
      averageDealSize,
      activeContacts,
    };
  }, [filteredOpportunities]);

  const stageStats = useMemo(() => {
    return stages.map((stage, index) => {
      const stageOpportunities = filteredOpportunities.filter(opp => opp.pipeline_stage_id === stage.id);
      const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
      
      return {
        id: stage.id,
        name: stage.name,
        color: stage.color.replace('bg-', '#').replace('-500', ''),
        count: stageOpportunities.length,
        value: stageValue,
        position: index + 1,
      };
    });
  }, [filteredOpportunities, stages]);

  return { stats, stageStats };
}

export function usePipelineMutations(pipelineId: string | null = null) {
  const { updateOpportunityStage } = useOpportunities();
  const { stages } = useStages(pipelineId);
  
  return {
    updateOpportunityStage: {
      mutate: ({ id, stageId }: { id: string; stageId: string }) => {
        const stage = stages.find(s => s.id === stageId);
        if (stage) {
          updateOpportunityStage(id, stageId);
        }
      },
    },
  };
}