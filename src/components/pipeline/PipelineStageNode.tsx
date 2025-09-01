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
      
      <Card className={cn("w-80 min-h-[400px] shadow-lg border-2", getColorClass(stage.color))}>
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stageOpportunities.map((opportunity) => (
              <div 
                key={opportunity.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="font-medium text-sm truncate flex-1">
                    {opportunity.patient_name || 'Unknown Contact'}
                  </div>
                  <div className="text-xs text-white/80 ml-2">
                    ${opportunity.estimated_value?.toLocaleString() || '0'}
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
            ))}
            
            
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