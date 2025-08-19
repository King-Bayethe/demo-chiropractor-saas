import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "./OpportunityCard";
import { Opportunity } from "@/hooks/useOpportunities";

interface OpportunityColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  opportunities: Opportunity[];
}

export function OpportunityColumn({ stage, opportunities }: OpportunityColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-h-0 ${
        isOver ? "bg-primary/5 border-primary/20" : "bg-muted/10"
      } border-2 border-dashed rounded-lg transition-colors`}
    >
      <Card className="flex-shrink-0 m-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
            <Badge variant="secondary" className={stage.color}>
              {opportunities.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Value</span>
            <span className="font-medium">${totalValue.toLocaleString()}</span>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <SortableContext items={opportunities.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {opportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </SortableContext>
        
        {opportunities.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop opportunities here
          </div>
        )}
      </div>
    </div>
  );
}