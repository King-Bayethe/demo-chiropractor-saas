import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface CarouselPipelineBoardProps {
  opportunities: Opportunity[];
  stages: PipelineStage[];
  onMoveOpportunity: (opportunityId: string, newStage: string) => void;
}

export function CarouselPipelineBoard({
  opportunities,
  stages,
  onMoveOpportunity,
}: CarouselPipelineBoardProps) {
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

  return (
    <PipelineDragProvider
      opportunities={opportunities}
      stages={stages}
      onMoveOpportunity={onMoveOpportunity}
    >
      <div className={cn("space-y-2", layout.shouldReduceSpacing ? "space-y-2" : "space-y-4")}>
        {/* Pipeline Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xl">Medical Pipeline</h3>
            <p className="text-muted-foreground text-base">
              {stages.length} stages • {opportunities.length} total opportunities
            </p>
          </div>
        </div>

        {/* Grid Pipeline Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => {
            const stageOpps = groupedOpportunities[stage.id] || [];
            const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
            const currentStageIndex = stages.findIndex(s => s.id === stage.id);
            
            return (
              <div key={stage.id} className="w-full">
                <Card className="overflow-hidden h-[500px]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div
                          className="rounded-full w-4 h-4"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="truncate">{stage.title}</span>
                      </CardTitle>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {stageOpps.length}
                      </Badge>
                    </div>
                    <p className="text-base text-muted-foreground">
                      Total: ${stageValue.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="overflow-y-auto h-[400px]">
                    <div className="space-y-4">
                      {stageOpps.length === 0 ? (
                        <div className="flex items-center justify-center text-muted-foreground h-40 text-base">
                          No opportunities in this stage
                        </div>
                      ) : (
                        stageOpps.map((opportunity) => (
                          <div key={opportunity.id} className="space-y-3">
                            <MedicalOpportunityCard
                              opportunity={opportunity}
                              onMoveToPrevious={currentStageIndex > 0 ? (id) => handleMoveToPrevious(id, stage.id) : undefined}
                              onMoveToNext={currentStageIndex < stages.length - 1 ? (id) => handleMoveToNext(id, stage.id) : undefined}
                              compact={true}
                            />
                            <div className="flex gap-2 px-3">
                              {currentStageIndex > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMoveToPrevious(opportunity.id, stage.id)}
                                  className="flex-1 text-xs"
                                >
                                  <ChevronLeft className="w-3 h-3 mr-1" />
                                  Back
                                </Button>
                              )}
                              {currentStageIndex < stages.length - 1 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMoveToNext(opportunity.id, stage.id)}
                                  className="flex-1 text-xs"
                                >
                                  Forward
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </PipelineDragProvider>
  );
}