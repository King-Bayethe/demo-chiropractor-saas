import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Opportunity } from '@/hooks/useOpportunities';
import { MedicalOpportunityCard } from './MedicalOpportunityCard';

interface MedicalOpportunityColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  opportunities: Opportunity[];
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
}

export function MedicalOpportunityColumn({ stage, opportunities, onEdit, onDelete }: MedicalOpportunityColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = opportunities.reduce((sum, opp) => {
    return sum + (opp.estimated_value || 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card 
      ref={setNodeRef}
      className={`flex flex-col h-full max-h-[calc(100vh-320px)] transition-colors duration-200 ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
            {stage.title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {opportunities.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="text-xs text-muted-foreground">
            Total: {formatCurrency(totalValue)}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 overflow-hidden">
        <SortableContext items={opportunities.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="h-full overflow-y-auto space-y-2 pr-2">
            {opportunities.map((opportunity) => (
              <MedicalOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {opportunities.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg p-6 w-full">
                  <div className="space-y-2">
                    <div>No opportunities in this stage</div>
                    <div className="text-xs">Drag opportunities here to move them to {stage.title}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}