import { useMemo } from 'react';
import { useOpportunities, MEDICAL_PIPELINE_STAGES } from './useOpportunities';

export function usePipelineStages() {
  const stages = MEDICAL_PIPELINE_STAGES.map(stage => ({
    ...stage,
    position: MEDICAL_PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1,
  }));

  return {
    data: stages,
    isLoading: false,
  };
}

export function usePipelineOpportunities() {
  const { opportunities, loading } = useOpportunities();
  
  return {
    data: opportunities,
    isLoading: loading,
  };
}

export function usePipelineStats() {
  const { opportunities } = useOpportunities();
  
  const stats = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    const averageDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    const activeContacts = new Set(opportunities.map(opp => opp.patient_name || 'Unknown')).size;
    
    return {
      totalOpportunities,
      totalValue,
      averageDealSize,
      activeContacts,
    };
  }, [opportunities]);

  const stageStats = useMemo(() => {
    return MEDICAL_PIPELINE_STAGES.map((stage, index) => {
      const stageOpportunities = opportunities.filter(opp => opp.pipeline_stage === stage.id);
      const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
      
      return {
        id: stage.id,
        name: stage.title,
        color: stage.color.replace('bg-', '#').replace('-500', ''),
        count: stageOpportunities.length,
        value: stageValue,
        position: index + 1,
      };
    });
  }, [opportunities]);

  return { stats, stageStats };
}

export function usePipelineMutations() {
  const { updateOpportunityStage } = useOpportunities();
  
  return {
    updateOpportunityStage: {
      mutate: ({ id, stageId }: { id: string; stageId: number | string }) => {
        const stage = MEDICAL_PIPELINE_STAGES.find(s => s.id === stageId || s.id === stageId.toString());
        if (stage) {
          updateOpportunityStage(id, stage.id);
        }
      },
    },
  };
}