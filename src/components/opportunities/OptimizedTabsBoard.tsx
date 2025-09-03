import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MedicalOpportunityCard } from "./MedicalOpportunityCard";
import { PipelineDragProvider } from "../pipeline/PipelineDragProvider";
import { usePipelineResponsive } from "@/hooks/useUnifiedResponsive";
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

interface OptimizedTabsBoardProps {
  opportunities: Opportunity[];
  stages: PipelineStage[];
  onMoveOpportunity: (opportunityId: string, newStage: string) => void;
}

export function OptimizedTabsBoard({
  opportunities,
  stages,
  onMoveOpportunity,
}: OptimizedTabsBoardProps) {
  const [activeStage, setActiveStage] = useState(stages[0]?.id || "");
  const responsive = usePipelineResponsive();

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
      <div className={cn("space-y-4", responsive.config.spacing.container)}>
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn(
              "font-semibold",
              responsive.config.typography.headingSize
            )}>
              Medical Pipeline
            </h3>
            <p className={cn(
              "text-muted-foreground",
              responsive.config.typography.textSize
            )}>
              {stages.length} stages • {opportunities.length} total opportunities
            </p>
          </div>
          
          {/* Stage Navigation Arrows - Hidden on mobile for space */}
          {!responsive.device.isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigatePrevious}
                disabled={!canNavigatePrevious}
                className="h-8 w-8 p-0 touch-target"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateNext}
                disabled={!canNavigateNext}
                className="h-8 w-8 p-0 touch-target"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Tabs Pipeline */}
        <Tabs value={activeStage} onValueChange={setActiveStage} className="w-full">
          <TabsList className={cn(
            "w-full justify-start scrollbar-hide",
            responsive.device.isMobile ? "overflow-x-auto" : ""
          )}>
            {stages.map((stage) => {
              const stageOpps = groupedOpportunities[stage.id] || [];
              const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
              
              return (
                <TabsTrigger
                  key={stage.id}
                  value={stage.id}
                  className={cn(
                    "flex items-center gap-2 min-w-fit touch-target",
                    responsive.device.isMobile ? "text-xs px-2" : "px-3"
                  )}
                >
                  <div
                    className="rounded-full w-3 h-3"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="truncate">
                    {responsive.device.isMobile 
                      ? stage.title.split(' ')[0] 
                      : stage.title
                    }
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stageOpps.length}
                  </Badge>
                  {responsive.config.behavior.showFullStats && (
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
                    <div className={cn(
                      "p-4 border-b bg-muted/20",
                      responsive.config.spacing.cardPadding
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-full w-5 h-5"
                            style={{ backgroundColor: stage.color }}
                          />
                          <div>
                            <h4 className={cn(
                              "font-semibold",
                              responsive.config.typography.headingSize
                            )}>
                              {stage.title}
                            </h4>
                            <p className={cn(
                              "text-muted-foreground",
                              responsive.config.typography.textSize
                            )}>
                              {stageOpps.length} opportunities • Total: ${stageValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Stage Navigation - Mobile friendly */}
                        <div className="flex items-center gap-2">
                          {currentStageIndex > 0 && (
                            <Button
                              variant="outline"
                              size={responsive.device.isMobile ? "sm" : "default"}
                              onClick={handleNavigatePrevious}
                              className="touch-target"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              {!responsive.device.isMobile && "Previous"}
                            </Button>
                          )}
                          {currentStageIndex < stages.length - 1 && (
                            <Button
                              variant="outline"
                              size={responsive.device.isMobile ? "sm" : "default"}
                              onClick={handleNavigateNext}
                              className="touch-target"
                            >
                              {!responsive.device.isMobile && "Next"}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stage Content */}
                    <div className={responsive.config.spacing.cardPadding}>
                      {stageOpps.length === 0 ? (
                        <div className="flex items-center justify-center text-muted-foreground h-40">
                          <div className="text-center">
                            <p>No opportunities in this stage</p>
                            <p className="text-sm mt-1">Move opportunities here from other stages</p>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "grid gap-4",
                          `grid-cols-${responsive.config.columns.opportunities}`
                        )}>
                          {stageOpps.slice(0, responsive.pipeline.performance.maxVisibleCards).map((opportunity) => (
                            <div key={opportunity.id} className={cn(
                              "space-y-3",
                              responsive.pipeline.performance.useVirtualization ? "pipeline-lazy" : ""
                            )}>
                              <MedicalOpportunityCard
                                opportunity={opportunity}
                                onMoveToPrevious={currentStageIndex > 0 ? (id) => handleMoveToPrevious(id, stage.id) : undefined}
                                onMoveToNext={currentStageIndex < stages.length - 1 ? (id) => handleMoveToNext(id, stage.id) : undefined}
                                compact={responsive.shouldUseCompactLayout}
                              />
                              
                              {/* Quick Move Buttons - Enhanced for touch */}
                              <div className="flex gap-2">
                                {currentStageIndex > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToPrevious(opportunity.id, stage.id)}
                                    className="flex-1 text-xs touch-target"
                                  >
                                    <ChevronLeft className="w-3 h-3 mr-1" />
                                    {responsive.device.isMobile 
                                      ? stages[currentStageIndex - 1]?.title.split(' ')[0]
                                      : stages[currentStageIndex - 1]?.title
                                    }
                                  </Button>
                                )}
                                {currentStageIndex < stages.length - 1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToNext(opportunity.id, stage.id)}
                                    className="flex-1 text-xs touch-target"
                                  >
                                    {responsive.device.isMobile 
                                      ? stages[currentStageIndex + 1]?.title.split(' ')[0]
                                      : stages[currentStageIndex + 1]?.title
                                    }
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