import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Opportunity } from '@/hooks/useOpportunities';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CompactOpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToPrevious?: (id: string) => void;
  onMoveToNext?: (id: string) => void;
  isDragging?: boolean;
}

export function CompactOpportunityCard({
  opportunity,
  onEdit,
  onDelete,
  onMoveToPrevious,
  onMoveToNext,
  isDragging = false,
}: CompactOpportunityCardProps) {
  const navigate = useNavigate();

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

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md cursor-pointer",
      isDragging && "rotate-2 shadow-lg opacity-50"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Header with Avatar and Priority */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {getInitials(opportunity.patient_name || opportunity.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm leading-none">
                {opportunity.patient_name || opportunity.name || 'Unknown Patient'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {opportunity.case_type || 'General'}
              </p>
            </div>
          </div>
          <Badge 
            className={cn(
              "text-xs px-2 py-1",
              getPriorityColor(opportunity.priority)
            )}
          >
            {opportunity.priority || 'Medium'}
          </Badge>
        </div>

        {/* Business Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Source:</span>
            <span className="text-xs font-medium">
              {opportunity.source || opportunity.referral_source || 'Direct'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Value:</span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(opportunity.estimated_value || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pt-2 border-t">
          {/* View Form Button */}
          {opportunity.form_submission_id && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/forms?submission=${opportunity.form_submission_id}`);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}

          {/* Edit Button */}
          {onEdit && (
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
          )}

          {/* Move Buttons */}
          {onMoveToPrevious && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToPrevious(opportunity.id);
              }}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}

          {onMoveToNext && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToNext(opportunity.id);
              }}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}