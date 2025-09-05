import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface KanbanOpportunityCardProps {
  opportunity: Opportunity;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function KanbanOpportunityCard({
  opportunity,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
}: KanbanOpportunityCardProps) {
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
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleView = () => {
    if (opportunity.form_submission_id) {
      navigate(`/forms?submission=${opportunity.form_submission_id}`);
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(opportunity.patient_name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-medium">
                {opportunity.patient_name || 'Unknown Patient'}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {opportunity.case_type || 'General'}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`h-2 w-2 rounded-full ${getPriorityColor(opportunity.priority)}`}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value:</span>
            <span className="text-sm font-medium">
              {formatCurrency(opportunity.estimated_value || 0)}
            </span>
          </div>
          
          {opportunity.source && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Source:</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {opportunity.source}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-2 border-t">
          <div className="flex items-center space-x-1">
            {opportunity.form_submission_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="h-7 w-7 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveRight}
              disabled={!canMoveRight}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}