import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";

interface CardActionsProps {
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hasFormSubmission?: boolean;
}

export function CardActions({
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onView,
  onEdit,
  onDelete,
  hasFormSubmission,
}: CardActionsProps) {
  return (
    <div className="flex items-center justify-between pt-3 mt-3 border-t">
      <div className="flex items-center gap-1">
        {hasFormSubmission && onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-8 w-8 p-0"
            aria-label="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
            aria-label="Edit opportunity"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            aria-label="Delete opportunity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
          className="h-8 w-8 p-0"
          aria-label="Move to previous stage"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveRight}
          disabled={!canMoveRight}
          className="h-8 w-8 p-0"
          aria-label="Move to next stage"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
