import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpportunityCardProps {
  opportunity: any;
  stageColor: string;
  canMovePrevious: boolean;
  canMoveNext: boolean;
  onMovePrevious: () => void;
  onMoveNext: () => void;
}

function OpportunityCard({ 
  opportunity, 
  stageColor, 
  canMovePrevious, 
  canMoveNext, 
  onMovePrevious, 
  onMoveNext 
}: OpportunityCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white space-y-2">
      <div className="flex items-start justify-between">
        <div className="font-medium text-sm truncate flex-1">
          {opportunity.patient_name || 'Unknown Contact'}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/80">
            ${opportunity.estimated_value?.toLocaleString() || '0'}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMovePrevious}
              disabled={!canMovePrevious}
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveNext}
              disabled={!canMoveNext}
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70 bg-white/10 px-2 py-1 rounded">
          {opportunity.case_type}
        </span>
        {(() => {
          const lastContactDate = opportunity.last_contact_date || opportunity.created_at;
          const daysSince = Math.floor((Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24));
          const urgencyColor = daysSince > 7 ? 'bg-red-500/20 text-red-200' : 
                             daysSince > 3 ? 'bg-yellow-500/20 text-yellow-200' : 
                             'bg-green-500/20 text-green-200';
          
          return (
            <span className={`px-2 py-1 rounded text-xs ${urgencyColor}`}>
              {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
            </span>
          );
        })()}
      </div>

      {(opportunity.patient_phone || opportunity.source) && (
        <div className="flex items-center justify-between text-xs text-white/70">
          {opportunity.patient_phone && (
            <span className="truncate">{opportunity.patient_phone}</span>
          )}
          {opportunity.source && (
            <span className="capitalize">{opportunity.source}</span>
          )}
        </div>
      )}

      {(opportunity.assigned_provider_name || opportunity.last_contact_date) && (
        <div className="flex items-center justify-between text-xs text-white/60">
          {opportunity.assigned_provider_name && (
            <span className="truncate">Dr. {opportunity.assigned_provider_name}</span>
          )}
          {opportunity.last_contact_date && (
            <span>
              Last: {new Date(opportunity.last_contact_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface PipelineStageNodeProps {
  data: {
    stage: {
      id: string;
      title: string;
      color: string;
      position: number;
    };
    opportunities: any[];
    allStages: any[];
    onMoveOpportunity?: (opportunityId: string, targetStageId: string) => void;
    isMobile?: boolean;
  };
}

export function PipelineStageNode({ data }: PipelineStageNodeProps) {
  const { stage, opportunities, allStages, onMoveOpportunity, isMobile } = data;
  
  // Filter opportunities for this stage
  const stageOpportunities = opportunities.filter(
    opp => opp.pipeline_stage === stage.id
  );

  const stageValue = stageOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0), 
    0
  );

  // Get stage navigation helpers
  const sortedStages = allStages.sort((a, b) => a.position - b.position);
  const currentStageIndex = sortedStages.findIndex(s => s.id === stage.id);
  const previousStage = currentStageIndex > 0 ? sortedStages[currentStageIndex - 1] : null;
  const nextStage = currentStageIndex < sortedStages.length - 1 ? sortedStages[currentStageIndex + 1] : null;


  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'bg-red-500': 'bg-red-500 border-red-200',
      'bg-orange-500': 'bg-orange-500 border-orange-200',
      'bg-yellow-500': 'bg-yellow-500 border-yellow-200',
      'bg-blue-500': 'bg-blue-500 border-blue-200',
      'bg-purple-500': 'bg-purple-500 border-purple-200',
      'bg-cyan-500': 'bg-cyan-500 border-cyan-200',
      'bg-green-500': 'bg-green-500 border-green-200',
    };
    return colorMap[color] || 'bg-gray-500 border-gray-200';
  };

  return (
    <div className="relative">
      <Handle 
        type="target" 
        position={isMobile ? Position.Top : Position.Left} 
        style={{ background: 'transparent', border: 'none' }} 
      />
      
      <Card className={cn(
        "shadow-lg border-2", 
        isMobile ? "w-72 min-h-[350px]" : "w-80 min-h-[400px]",
        getColorClass(stage.color)
      )}>
        <CardHeader className={cn("pb-3", isMobile ? "p-3" : "p-6")}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "font-semibold text-white",
              isMobile ? "text-base" : "text-lg"
            )}>
              {stage.title}
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {stageOpportunities.length}
            </Badge>
          </div>
          <div className={cn(
            "text-white/90 font-medium",
            isMobile ? "text-xs" : "text-sm"
          )}>
            ${stageValue.toLocaleString()}
          </div>
        </CardHeader>
        
        <CardContent className={cn("pt-0", isMobile ? "p-3" : "p-6")}>
          <div className={cn(
            "space-y-2 overflow-y-auto",
            isMobile ? "max-h-80" : "max-h-96"
          )}>
            {stageOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                stageColor={stage.color}
                canMovePrevious={!!previousStage}
                canMoveNext={!!nextStage}
                onMovePrevious={() => {
                  if (previousStage && onMoveOpportunity) {
                    onMoveOpportunity(opportunity.id, previousStage.id);
                  }
                }}
                onMoveNext={() => {
                  if (nextStage && onMoveOpportunity) {
                    onMoveOpportunity(opportunity.id, nextStage.id);
                  }
                }}
              />
            ))}
            
            {stageOpportunities.length === 0 && (
              <div className={cn(
                "text-center text-white/60 py-4",
                isMobile ? "text-xs" : "text-sm"
              )}>
                No opportunities
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle 
        type="source" 
        position={isMobile ? Position.Bottom : Position.Right} 
        style={{ background: 'transparent', border: 'none' }} 
      />
    </div>
  );
}