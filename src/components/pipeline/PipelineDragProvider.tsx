import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

interface PipelineDragProviderProps {
  children: React.ReactNode;
  onMoveOpportunity: (opportunityId: string, targetStageId: string) => void;
  opportunities: any[];
  stages: any[];
}

export function PipelineDragProvider({ 
  children, 
  onMoveOpportunity, 
  opportunities, 
  stages 
}: PipelineDragProviderProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = React.useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const opportunity = opportunities.find(opp => opp.id === active.id);
    setDraggedOpportunity(opportunity);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Check if we're dropping on a stage
      const targetStageId = over.id as string;
      if (targetStageId.startsWith('stage-')) {
        const stageId = targetStageId.replace('stage-', '');
        onMoveOpportunity(active.id as string, stageId);
      }
    }
    
    setActiveId(null);
    setDraggedOpportunity(null);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId && draggedOpportunity ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white space-y-2 shadow-lg border border-white/30 rotate-3">
            <div className="font-medium text-sm">
              {draggedOpportunity.patient_name || 'Unknown Contact'}
            </div>
            <div className="text-xs text-white/80">
              ${draggedOpportunity.estimated_value?.toLocaleString() || '0'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface StageDropZoneProps {
  stageId: string;
  children: React.ReactNode;
  className?: string;
}

export function StageDropZone({ stageId, children, className }: StageDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stageId}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={className}
      style={{
        backgroundColor: isOver ? 'rgba(255, 255, 255, 0.1)' : undefined,
        transition: 'background-color 200ms ease',
      }}
    >
      {children}
    </div>
  );
}