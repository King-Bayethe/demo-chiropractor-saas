import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, DollarSign, Clock, AlertTriangle, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';
import { cn } from '@/lib/utils';

interface MobilePipelineProps {
  opportunities: any[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
}

export function MobilePipeline({ opportunities, onMoveOpportunity }: MobilePipelineProps) {
  const [activeStage, setActiveStage] = useState(MEDICAL_PIPELINE_STAGES[0].id);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = getStageIndex(activeStage);
    
    if (isLeftSwipe && currentIndex < MEDICAL_PIPELINE_STAGES.length - 1) {
      setActiveStage(MEDICAL_PIPELINE_STAGES[currentIndex + 1].id);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setActiveStage(MEDICAL_PIPELINE_STAGES[currentIndex - 1].id);
    }
  };

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
    <div 
      className="w-full"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Stage Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={getStageIndex(activeStage) === 0}
          onClick={() => {
            const currentIndex = getStageIndex(activeStage);
            if (currentIndex > 0) {
              setActiveStage(MEDICAL_PIPELINE_STAGES[currentIndex - 1].id);
            }
          }}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <h3 className="font-semibold text-lg">
            {MEDICAL_PIPELINE_STAGES.find(s => s.id === activeStage)?.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Swipe to navigate • {getStageIndex(activeStage) + 1} of {MEDICAL_PIPELINE_STAGES.length}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={getStageIndex(activeStage) === MEDICAL_PIPELINE_STAGES.length - 1}
          onClick={() => {
            const currentIndex = getStageIndex(activeStage);
            if (currentIndex < MEDICAL_PIPELINE_STAGES.length - 1) {
              setActiveStage(MEDICAL_PIPELINE_STAGES[currentIndex + 1].id);
            }
          }}
          className="h-8 w-8 p-0"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage Indicator Dots */}
      <div className="flex justify-center gap-1 mb-4">
        {MEDICAL_PIPELINE_STAGES.map((stage, index) => {
          const stageOpportunities = getStageOpportunities(stage.id);
          const isActive = stage.id === activeStage;
          
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={cn(
                "relative h-2 rounded-full transition-all duration-200",
                isActive ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"
              )}
            >
              {stageOpportunities.length > 0 && (
                <div 
                  className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full text-[10px] font-bold flex items-center justify-center",
                    stage.color.replace('bg-', 'bg-') + '-500 text-white'
                  )}
                >
                  {stageOpportunities.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Tabs value={activeStage} onValueChange={setActiveStage}>
        <TabsList className="hidden">
          {MEDICAL_PIPELINE_STAGES.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id}>
              {stage.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {MEDICAL_PIPELINE_STAGES.map((stage) => {
          const stageOpportunities = getStageOpportunities(stage.id);
          const stageValue = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
          const previousStage = getPreviousStage(stage.id);
          const nextStage = getNextStage(stage.id);

          return (
            <TabsContent key={stage.id} value={stage.id} className="mt-0">
              {/* Stage Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">{stageOpportunities.length}</div>
                    <div className="text-xs text-muted-foreground">Opportunities</div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">${(stageValue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      ${stageOpportunities.length > 0 ? (stageValue / stageOpportunities.length / 1000).toFixed(0) : 0}k
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Value</div>
                  </div>
                </Card>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3">
                {stageOpportunities.length === 0 ? (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No opportunities in this stage</p>
                      <p className="text-xs mt-1">New leads will appear here first</p>
                    </div>
                  </Card>
                ) : (
                  stageOpportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="border-l-4 border-l-primary/40 hover:border-l-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base leading-tight">
                                {opportunity.patient_name || 'Unknown Patient'}
                              </h4>
                              <p className="text-sm text-muted-foreground capitalize mt-1">
                                {opportunity.case_type || 'General Consultation'}
                              </p>
                            </div>
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "ml-2 text-xs font-semibold",
                                opportunity.urgency === 'high' && "bg-red-100 text-red-700 border-red-200",
                                opportunity.urgency === 'medium' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                opportunity.urgency === 'low' && "bg-green-100 text-green-700 border-green-200"
                              )}
                            >
                              {opportunity.urgency || 'Medium'}
                            </Badge>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium">${(opportunity.estimated_value || 0).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Estimated Value</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="font-medium">
                                  {opportunity.created_at 
                                    ? new Date(opportunity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'Unknown'
                                  }
                                </div>
                                <div className="text-xs text-muted-foreground">Created</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!previousStage}
                              onClick={() => handleMoveOpportunity(opportunity.id, 'prev')}
                              className="flex-1 h-10"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              {previousStage ? previousStage.title : 'First'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!nextStage}
                              onClick={() => handleMoveOpportunity(opportunity.id, 'next')}
                              className="flex-1 h-10"
                            >
                              {nextStage ? nextStage.title : 'Final'}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}