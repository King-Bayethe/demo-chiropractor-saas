import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const layout = useAdaptiveLayout();

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
      <div className={cn("space-y-2", layout.shouldReduceSpacing ? "space-y-2" : "space-y-4")}>
        {/* Stage Navigation Header */}
        <div className={cn(
          "flex items-center justify-between",
          layout.shouldUseCompactLayout ? "flex-col gap-2" : "flex-row"
        )}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={cn(
                "rounded-full flex-shrink-0",
                layout.shouldUseCompactLayout ? "w-2.5 h-2.5" : "w-3 h-3"
              )}
              style={{ backgroundColor: currentStage.color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className={cn(
                "font-semibold truncate",
                layout.shouldUseCompactLayout ? "text-sm" : "text-lg"
              )}>
                {currentStage.title}
              </h3>
              <p className={cn(
                "text-muted-foreground",
                layout.shouldUseCompactLayout ? "text-xs" : "text-sm"
              )}>
                Stage {current + 1} of {stages.length} • {stageOpportunities.length} opps • ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Stage Indicators */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {stages.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-colors",
                  layout.shouldUseCompactLayout ? "w-1.5 h-1.5" : "w-2 h-2",
                  index === current ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Carousel */}
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {stages.map((stage) => {
              const stageOpps = groupedOpportunities[stage.id] || [];
              const stageValue = stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
              
              return (
                <CarouselItem key={stage.id}>
                  <Card 
                    className={cn("overflow-hidden")}
                    style={{ 
                      height: `clamp(300px, ${layout.cardHeight}px, 80vh)`
                    }}
                  >
                    <CardHeader className={cn(
                      layout.shouldUseCompactLayout ? "pb-2 px-3 py-2" : "pb-3"
                    )}>
                      <div className="flex items-center justify-between">
                        <CardTitle className={cn(
                          "flex items-center gap-2",
                          layout.shouldUseCompactLayout ? "text-sm" : "text-base"
                        )}>
                          <div
                            className={cn(
                              "rounded-full",
                              layout.shouldUseCompactLayout ? "w-2.5 h-2.5" : "w-3 h-3"
                            )}
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="truncate">{stage.title}</span>
                        </CardTitle>
                        <Badge variant="secondary" className={cn(
                          layout.shouldUseCompactLayout ? "text-xs px-1.5 py-0.5" : ""
                        )}>
                          {stageOpps.length}
                        </Badge>
                      </div>
                      {!layout.shouldUseCompactLayout && (
                        <p className="text-sm text-muted-foreground">
                          Total: ${stageValue.toLocaleString()}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent 
                      className={cn(
                        "overflow-y-auto",
                        layout.shouldUseCompactLayout ? "px-3 pb-2" : ""
                      )}
                      style={{ 
                        height: `calc(100% - ${layout.shouldUseCompactLayout ? '60px' : '80px'})`
                      }}
                    >
                      <div className={cn(
                        layout.shouldUseCompactLayout ? "space-y-2" : "space-y-3"
                      )}>
                        {stageOpps.length === 0 ? (
                          <div className={cn(
                            "flex items-center justify-center text-muted-foreground",
                            layout.shouldUseCompactLayout ? "h-24 text-xs" : "h-32"
                          )}>
                            No opportunities in this stage
                          </div>
                        ) : (
                          stageOpps.map((opportunity) => (
                            <div key={opportunity.id} className={cn(
                              layout.shouldUseCompactLayout ? "space-y-1" : "space-y-2"
                            )}>
                              <MedicalOpportunityCard
                                opportunity={opportunity}
                                onMoveToPrevious={current > 0 ? handleMoveToPrevious : undefined}
                                onMoveToNext={current < stages.length - 1 ? handleMoveToNext : undefined}
                                compact={layout.shouldUseCompactLayout}
                              />
                              {/* Quick Stage Actions - Hidden on very small screens */}
                              {!layout.shouldUseCompactLayout && (
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
                              )}
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
          <CarouselPrevious className={cn(
            "left-1",
            layout.shouldUseCompactLayout ? "h-7 w-7" : "left-2"
          )} />
          <CarouselNext className={cn(
            "right-1", 
            layout.shouldUseCompactLayout ? "h-7 w-7" : "right-2"
          )} />
        </Carousel>

        {/* Navigation Info */}
        {!layout.shouldUseCompactLayout && (
          <div className="text-center text-sm text-muted-foreground">
            Use arrows or swipe to navigate between stages
          </div>
        )}
      </div>
    </PipelineDragProvider>
  );
}