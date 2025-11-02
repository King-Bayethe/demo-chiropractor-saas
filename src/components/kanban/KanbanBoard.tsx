import { useKanbanScroll } from "@/hooks/useKanbanScroll";
import { KanbanColumn } from "./KanbanColumn";
import { ScrollControls } from "./ScrollControls";
import { cn } from "@/lib/utils";

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
  pipeline_stage_id?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface KanbanBoardProps {
  stages: Stage[];
  opportunities: Opportunity[];
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
}

export function KanbanBoard({
  stages,
  opportunities,
  onMoveOpportunity,
}: KanbanBoardProps) {
  const {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  } = useKanbanScroll();

  return (
    <div className="relative">
      <ScrollControls
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
      />

      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto overflow-y-visible pb-4",
          "scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-muted/20"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
        }}
      >
        <div className="flex gap-4 min-w-max px-1 py-1">
          {stages.map((stage) => {
            const stageOpportunities = opportunities.filter(
              opp => opp.pipeline_stage_id === stage.id
            );

            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                opportunities={stageOpportunities}
                allStages={stages}
                onMoveOpportunity={onMoveOpportunity}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
