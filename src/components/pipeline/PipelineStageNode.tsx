import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStageNodeProps {
  data: {
    stage: {
      id: string;
      title: string;
      color: string;
      position: number;
    };
    opportunities: any[];
    onMoveOpportunity?: (opportunityId: string, targetStageId: string) => void;
  };
}

export function PipelineStageNode({ data }: PipelineStageNodeProps) {
  const { stage, opportunities } = data;
  
  // Filter opportunities for this stage
  const stageOpportunities = opportunities.filter(
    opp => opp.pipeline_stage === stage.id
  );

  const stageValue = stageOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0), 
    0
  );

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
      <Handle type="target" position={Position.Left} style={{ background: 'transparent', border: 'none' }} />
      
      <Card className={cn("w-80 min-h-[200px] shadow-lg border-2", getColorClass(stage.color))}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              {stage.title}
            </CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {stageOpportunities.length}
            </Badge>
          </div>
          <div className="text-white/90 text-sm font-medium">
            ${stageValue.toLocaleString()}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stageOpportunities.slice(0, 3).map((opportunity) => (
              <div 
                key={opportunity.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white"
              >
                <div className="font-medium text-sm truncate">
                  {opportunity.patient_name || opportunity.contact_name || 'Unknown Contact'}
                </div>
                <div className="text-xs text-white/80">
                  ${opportunity.estimated_value?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-white/70">
                  {opportunity.case_type}
                </div>
              </div>
            ))}
            
            {stageOpportunities.length > 3 && (
              <div className="text-center text-white/80 text-xs py-2">
                +{stageOpportunities.length - 3} more
              </div>
            )}
            
            {stageOpportunities.length === 0 && (
              <div className="text-center text-white/60 text-sm py-4">
                No opportunities
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Right} style={{ background: 'transparent', border: 'none' }} />
    </div>
  );
}