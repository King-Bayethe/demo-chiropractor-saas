import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MedicalOpportunityCard } from "./MedicalOpportunityCard";
import { PipelineDragProvider } from "../pipeline/PipelineDragProvider";
import { useAdaptiveLayout } from "@/hooks/useViewportResize";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  case_type?: string;
  estimated_value?: number;
  insurance_coverage_amount?: number;
  attorney_referred: boolean;
  attorney_name?: string;
  attorney_contact?: string;
  pipeline_stage: string;
  expected_close_date?: string;
  consultation_scheduled_at?: string;
  treatment_start_date?: string;
  source?: string;
  referral_source?: string;
  form_submission_id?: string;
  assigned_to?: string;
  assigned_provider_name?: string;
  created_by: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
}

interface PipelineStage {
  id: string;
  title: string;
  color: string;
  position: number;
}

interface TabsPipelineBoardProps {
  opportunities: Opportunity[];
  stages: PipelineStage[];
  onMoveOpportunity: (opportunityId: string, newStage: string) => void;
}

export function TabsPipelineBoard({
  opportunities,
  stages,
  onMoveOpportunity,
}: TabsPipelineBoardProps) {
  const [activeStage, setActiveStage] = useState(stages[0]?.id || "");
  const layout = useAdaptiveLayout();

  const groupedOpportunities = React.useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = opportunities.filter(
        (opp) => opp.pipeline_stage === stage.id
      );
      return acc;
    }, {} as Record<string, Opportunity[]>);
  }, [opportunities, stages]);

  const handleMoveToNext = (opportunityId: string, currentStageId: string) => {
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      onMoveOpportunity(opportunityId, stages[nextStageIndex].id);
    }
  };

  const handleMoveToPrevious = (opportunityId: string, currentStageId: string) => {
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
    const prevStageIndex = currentStageIndex - 1;
    if (prevStageIndex >= 0) {
      onMoveOpportunity(opportunityId, stages[prevStageIndex].id);
    }
  };

  const handleNavigatePrevious = () => {
    const currentIndex = stages.findIndex(s => s.id === activeStage);
    if (currentIndex > 0) {
      setActiveStage(stages[currentIndex - 1].id);
    }
  };

  const handleNavigateNext = () => {
    const currentIndex = stages.findIndex(s => s.id === activeStage);
    if (currentIndex < stages.length - 1) {
      setActiveStage(stages[currentIndex + 1].id);
    }
  };

  const currentStageIndex = stages.findIndex(s => s.id === activeStage);
  const canNavigatePrevious = currentStageIndex > 0;
  const canNavigateNext = currentStageIndex < stages.length - 1;

  return (
    <PipelineDragProvider
      opportunities={opportunities}
      stages={stages}
      onMoveOpportunity={onMoveOpportunity}
    >
      <div className="space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xl">Medical Pipeline</h3>
            <p className="text-muted-foreground text-base">
              {stages.length} stages • {opportunities.length} total opportunities
            </p>
          </div>
          
          {/* Stage Navigation Arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigatePrevious}
              disabled={!canNavigatePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateNext}
              disabled={!canNavigateNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs Pipeline */}
        <Tabs value={activeStage} onValueChange={setActiveStage} className="w-full">
          <TabsList className="w-full justify-start">
            {stages.map((stage) => {
              const stageOpps = groupedOpportunities[stage.id] || [];
              const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
              
              return (
                <TabsTrigger
                  key={stage.id}
                  value={stage.id}
                  className="flex items-center gap-2 min-w-fit"
                >
                  <div
                    className="rounded-full w-3 h-3"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="truncate">{stage.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stageOpps.length}
                  </Badge>
                  {!layout.shouldUseCompactLayout && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ${Math.round(stageValue / 1000)}k
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {stages.map((stage) => {
            const stageOpps = groupedOpportunities[stage.id] || [];
            const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
            const currentStageIndex = stages.findIndex(s => s.id === stage.id);
            
            return (
              <TabsContent key={stage.id} value={stage.id} className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {/* Stage Header */}
                    <div className="p-4 border-b bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-full w-5 h-5"
                            style={{ backgroundColor: stage.color }}
                          />
                          <div>
                            <h4 className="font-semibold text-lg">{stage.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stageOpps.length} opportunities • Total: ${stageValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Stage Navigation */}
                        <div className="flex items-center gap-2">
                          {currentStageIndex > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNavigatePrevious}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                          )}
                          {currentStageIndex < stages.length - 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNavigateNext}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stage Content */}
                    <div className="p-4">
                      {stageOpps.length === 0 ? (
                        <div className="flex items-center justify-center text-muted-foreground h-40 text-base">
                          <div className="text-center">
                            <p>No opportunities in this stage</p>
                            <p className="text-sm mt-1">Move opportunities here from other stages</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {stageOpps.map((opportunity) => (
                            <div key={opportunity.id} className="space-y-3">
                              <MedicalOpportunityCard
                                opportunity={opportunity}
                                onMoveToPrevious={currentStageIndex > 0 ? (id) => handleMoveToPrevious(id, stage.id) : undefined}
                                onMoveToNext={currentStageIndex < stages.length - 1 ? (id) => handleMoveToNext(id, stage.id) : undefined}
                                compact={layout.shouldUseCompactLayout}
                              />
                              
                              {/* Quick Move Buttons */}
                              <div className="flex gap-2">
                                {currentStageIndex > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToPrevious(opportunity.id, stage.id)}
                                    className="flex-1 text-xs"
                                  >
                                    <ChevronLeft className="w-3 h-3 mr-1" />
                                    {stages[currentStageIndex - 1]?.title}
                                  </Button>
                                )}
                                {currentStageIndex < stages.length - 1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToNext(opportunity.id, stage.id)}
                                    className="flex-1 text-xs"
                                  >
                                    {stages[currentStageIndex + 1]?.title}
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </PipelineDragProvider>
  );
}