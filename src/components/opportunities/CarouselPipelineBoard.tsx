import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MedicalOpportunityCard } from "./MedicalOpportunityCard";
import { PipelineDragProvider } from "../pipeline/PipelineDragProvider";

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
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const groupedOpportunities = React.useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = opportunities.filter(
        (opp) => opp.pipeline_stage === stage.id
      );
      return acc;
    }, {} as Record<string, Opportunity[]>);
  }, [opportunities, stages]);

  const currentStage = stages[current];
  const stageOpportunities = groupedOpportunities[currentStage?.id] || [];
  const totalValue = stageOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  );

  const handleMoveToNext = (opportunityId: string) => {
    const nextStageIndex = current + 1;
    if (nextStageIndex < stages.length) {
      onMoveOpportunity(opportunityId, stages[nextStageIndex].id);
    }
  };

  const handleMoveToPrevious = (opportunityId: string) => {
    const prevStageIndex = current - 1;
    if (prevStageIndex >= 0) {
      onMoveOpportunity(opportunityId, stages[prevStageIndex].id);
    }
  };

  if (!currentStage) return null;

  return (
    <PipelineDragProvider
      opportunities={opportunities}
      stages={stages}
      onMoveOpportunity={onMoveOpportunity}
    >
      <div className="space-y-4">
        {/* Stage Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentStage.color }}
            />
            <div>
              <h3 className="text-lg font-semibold">{currentStage.title}</h3>
              <p className="text-sm text-muted-foreground">
                Stage {current + 1} of {stages.length} • {stageOpportunities.length} opportunities • ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Stage Indicators */}
          <div className="flex items-center gap-2">
            {stages.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === current ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Carousel */}
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {stages.map((stage) => {
              const stageOpps = groupedOpportunities[stage.id] || [];
              return (
                <CarouselItem key={stage.id}>
                  <Card className="h-[450px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.title}
                        </CardTitle>
                        <Badge variant="secondary">
                          {stageOpps.length}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total: ${stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="h-[350px] overflow-y-auto">
                      <div className="space-y-3">
                        {stageOpps.length === 0 ? (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            No opportunities in this stage
                          </div>
                        ) : (
                          stageOpps.map((opportunity) => (
                            <div key={opportunity.id} className="space-y-2">
                              <MedicalOpportunityCard
                                opportunity={opportunity}
                                onMoveToPrevious={current > 0 ? handleMoveToPrevious : undefined}
                                onMoveToNext={current < stages.length - 1 ? handleMoveToNext : undefined}
                              />
                              {/* Quick Stage Actions */}
                              <div className="flex gap-2 px-2">
                                {current > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToPrevious(opportunity.id)}
                                    className="flex-1 text-xs"
                                  >
                                    <ChevronLeft className="w-3 h-3 mr-1" />
                                    Move Back
                                  </Button>
                                )}
                                {current < stages.length - 1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMoveToNext(opportunity.id)}
                                    className="flex-1 text-xs"
                                  >
                                    Move Forward
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
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        {/* Navigation Info */}
        <div className="text-center text-sm text-muted-foreground">
          Use arrows or swipe to navigate between stages
        </div>
      </div>
    </PipelineDragProvider>
  );
}