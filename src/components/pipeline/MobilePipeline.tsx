import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';

interface MobilePipelineProps {
  opportunities: any[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
}

export function MobilePipeline({ opportunities, onMoveOpportunity }: MobilePipelineProps) {
  const [activeStage, setActiveStage] = useState(MEDICAL_PIPELINE_STAGES[0].id);

  const getStageOpportunities = (stageId: string) => {
    return opportunities.filter(opp => opp.pipeline_stage === stageId);
  };

  const getStageIndex = (stageId: string) => {
    return MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === stageId);
  };

  const getPreviousStage = (currentStageId: string) => {
    const currentIndex = getStageIndex(currentStageId);
    return currentIndex > 0 ? MEDICAL_PIPELINE_STAGES[currentIndex - 1] : null;
  };

  const getNextStage = (currentStageId: string) => {
    const currentIndex = getStageIndex(currentStageId);
    return currentIndex < MEDICAL_PIPELINE_STAGES.length - 1 ? MEDICAL_PIPELINE_STAGES[currentIndex + 1] : null;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const handleMoveOpportunity = (opportunityId: string, direction: 'prev' | 'next') => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const targetStage = direction === 'prev' 
      ? getPreviousStage(opportunity.pipeline_stage)
      : getNextStage(opportunity.pipeline_stage);

    if (targetStage) {
      onMoveOpportunity(opportunityId, targetStage.id);
    }
  };

  return (
    <div className="w-full">
      <Tabs value={activeStage} onValueChange={setActiveStage}>
        <TabsList className="w-full h-auto p-1 bg-muted/30 gap-1">
          {MEDICAL_PIPELINE_STAGES.map((stage) => {
            const stageOpportunities = getStageOpportunities(stage.id);
            const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
            
            return (
              <TabsTrigger 
                key={stage.id} 
                value={stage.id} 
                className="flex-1 min-w-0 flex flex-col gap-1 p-2 h-auto data-[state=active]:bg-background"
              >
                <div className="flex items-center gap-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${stage.color.replace('bg-', 'bg-')}-500`}
                  />
                  <span className="text-xs font-medium truncate">{stage.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{stageOpportunities.length}</span>
                  <span>${(stageValue / 1000).toFixed(0)}k</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {MEDICAL_PIPELINE_STAGES.map((stage) => {
          const stageOpportunities = getStageOpportunities(stage.id);
          const previousStage = getPreviousStage(stage.id);
          const nextStage = getNextStage(stage.id);

          return (
            <TabsContent key={stage.id} value={stage.id} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color.replace('bg-', 'bg-')}-500`} />
                      {stage.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {stageOpportunities.length} opportunities
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageOpportunities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No opportunities in this stage</p>
                    </div>
                  ) : (
                    stageOpportunities.map((opportunity) => (
                      <Card key={opportunity.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{opportunity.patient_name || 'Unknown Patient'}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {opportunity.case_type || 'General'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`${getUrgencyColor(opportunity.urgency)} text-white text-xs`}
                                >
                                  {opportunity.urgency || 'Medium'}
                                </Badge>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${(opportunity.estimated_value || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {opportunity.created_at 
                                    ? new Date(opportunity.created_at).toLocaleDateString()
                                    : 'Unknown'
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!previousStage}
                                onClick={() => handleMoveOpportunity(opportunity.id, 'prev')}
                                className="flex items-center gap-1"
                              >
                                <ChevronLeft className="h-3 w-3" />
                                {previousStage ? previousStage.title : 'First Stage'}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!nextStage}
                                onClick={() => handleMoveOpportunity(opportunity.id, 'next')}
                                className="flex items-center gap-1"
                              >
                                {nextStage ? nextStage.title : 'Final Stage'}
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}