import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "./OpportunityCard";
import { FileQuestion } from "lucide-react";

interface Opportunity {
  id: string;
  name?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  case_type?: string;
  estimated_value?: number;
  priority?: string;
  source?: string;
  form_submission_id?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface KanbanColumnProps {
  stage: Stage;
  opportunities: Opportunity[];
  allStages: Stage[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
}

export function KanbanColumn({
  stage,
  opportunities,
  allStages,
  onMoveOpportunity,
}: KanbanColumnProps) {
  const stageIndex = allStages.findIndex(s => s.id === stage.id);
  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleMoveLeft = (opportunityId: string) => {
    if (stageIndex > 0) {
      onMoveOpportunity(opportunityId, allStages[stageIndex - 1].id);
    }
  };

  const handleMoveRight = (opportunityId: string) => {
    if (stageIndex < allStages.length - 1) {
      onMoveOpportunity(opportunityId, allStages[stageIndex + 1].id);
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full flex flex-col border-2">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div 
                className={`h-3 w-3 rounded-full ${stage.color}`}
                aria-hidden="true"
              />
              {stage.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {opportunities.length}
            </Badge>
          </div>
          {stage.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {stage.description}
            </p>
          )}
          <div className="text-xs font-medium text-primary mt-2">
            Total: {formatCurrency(totalValue)}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 overflow-y-auto min-h-[200px]">
          {opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <FileQuestion className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No opportunities in this stage
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  canMoveLeft={stageIndex > 0}
                  canMoveRight={stageIndex < allStages.length - 1}
                  onMoveLeft={() => handleMoveLeft(opportunity.id)}
                  onMoveRight={() => handleMoveRight(opportunity.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
