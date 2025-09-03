import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  User,
  DollarSign,
  Calendar,
  Phone
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Opportunity } from '@/hooks/useOpportunities';
import { useUnifiedResponsive } from '@/hooks/useUnifiedResponsive';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EnhancedCompactOpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToPrevious?: (id: string) => void;
  onMoveToNext?: (id: string) => void;
  onView?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  isDragging?: boolean;
}

export function EnhancedCompactOpportunityCard({
  opportunity,
  onEdit,
  onDelete,
  onMoveToPrevious,
  onMoveToNext,
  onView,
  isSelected = false,
  onSelect,
  isDragging = false,
}: EnhancedCompactOpportunityCardProps) {
  const navigate = useNavigate();
  const responsive = useUnifiedResponsive();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd click
      onSelect?.(opportunity.id, !isSelected);
    } else if (onView) {
      onView(opportunity.id);
    } else if (opportunity.form_submission_id) {
      navigate(`/forms?submission=${opportunity.form_submission_id}`);
    }
  }, [opportunity.id, opportunity.form_submission_id, isSelected, onSelect, onView, navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onView) {
          onView(opportunity.id);
        } else if (opportunity.form_submission_id) {
          navigate(`/forms?submission=${opportunity.form_submission_id}`);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onMoveToPrevious?.(opportunity.id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        onMoveToNext?.(opportunity.id);
        break;
      case 'Delete':
        e.preventDefault();
        onDelete?.(opportunity.id);
        break;
      case 'e':
        if (e.ctrlKey) {
          e.preventDefault();
          onEdit?.(opportunity.id);
        }
        break;
    }
  }, [opportunity.id, opportunity.form_submission_id, onView, onMoveToPrevious, onMoveToNext, onDelete, onEdit, navigate]);

  return (
    <Card 
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      className={cn(
        "relative group border transition-all duration-200",
        isDragging && "rotate-2 shadow-lg opacity-50 scale-105 z-50",
        isSelected && "ring-2 ring-primary ring-offset-2",
        "hover:shadow-md hover:border-border cursor-pointer",
        "touch-target select-none"
      )}
      tabIndex={0}
      role="button"
      aria-label={`Opportunity for ${opportunity.patient_name || opportunity.name} - Value: ${formatCurrency(opportunity.estimated_value || 0)}, Priority: ${opportunity.priority || 'Medium'}`}
      data-opportunity-card
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setShowActions(true)}
      onBlur={() => setShowActions(false)}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Avatar, Selection, and Priority */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(opportunity.id, e.target.checked);
                }}
                className="rounded border-border"
                aria-label="Select opportunity"
              />
            )}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {getInitials(opportunity.patient_name || opportunity.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm leading-none truncate">
                {opportunity.patient_name || opportunity.name || 'Unknown Patient'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {opportunity.case_type || 'General'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "text-xs px-2 py-1",
                getPriorityColor(opportunity.priority)
              )}
            >
              {opportunity.priority || 'Medium'}
            </Badge>
            
            {/* Quick Actions Menu */}
            {(isHovered || showActions) && (
              <div className="flex items-center gap-1">
                {onMoveToPrevious && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToPrevious(opportunity.id);
                          }}
                          data-move="previous"
                          aria-label="Move to previous stage"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Left (←)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {onMoveToNext && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToNext(opportunity.id);
                          }}
                          data-move="next"
                          aria-label="Move to next stage"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Right (→)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* More Actions Button */}
                {(onEdit || onDelete || onView) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(!showActions);
                          }}
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More Actions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Source:</span>
            <span className="text-xs font-medium truncate ml-2">
              {opportunity.source || opportunity.referral_source || 'Direct'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Value:</span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(opportunity.estimated_value || 0)}
            </span>
          </div>
          {opportunity.created_at && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs font-medium">
                {new Date(opportunity.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pt-2 border-t">
          {/* View Form Button */}
          {(opportunity.form_submission_id || onView) && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (onView) {
                  onView(opportunity.id);
                } else if (opportunity.form_submission_id) {
                  navigate(`/forms?submission=${opportunity.form_submission_id}`);
                }
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(opportunity.id);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit (Ctrl+E)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Delete Button */}
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(opportunity.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete (Del)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Extended Actions Menu */}
        {showActions && (onView || onEdit || onDelete) && (
          <div className="absolute top-2 right-2 z-10 bg-background border rounded-md shadow-lg p-1 flex flex-col gap-1 min-w-[100px]">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 justify-start text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(opportunity.id);
                  setShowActions(false);
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 justify-start text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(opportunity.id);
                  setShowActions(false);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 justify-start text-xs text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(opportunity.id);
                  setShowActions(false);
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}