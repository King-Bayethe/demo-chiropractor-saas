import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type PipelineViewType = 'tabs' | 'kanban';

interface PipelineViewToggleProps {
  view: PipelineViewType;
  onViewChange: (view: PipelineViewType) => void;
  className?: string;
}

export function PipelineViewToggle({ view, onViewChange, className }: PipelineViewToggleProps) {
  return (
    <div className={cn("flex items-center border rounded-lg p-1", className)}>
      <Button
        variant={view === 'tabs' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('tabs')}
        className={cn(
          "flex items-center gap-2",
          view === 'tabs' ? "shadow-sm" : "hover:bg-muted"
        )}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Tabs</span>
      </Button>
      <Button
        variant={view === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className={cn(
          "flex items-center gap-2",
          view === 'kanban' ? "shadow-sm" : "hover:bg-muted"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Kanban</span>
      </Button>
    </div>
  );
}