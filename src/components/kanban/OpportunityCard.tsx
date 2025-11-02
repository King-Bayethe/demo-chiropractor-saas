import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardActions } from "./CardActions";
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

interface OpportunityCardProps {
  opportunity: Opportunity;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function OpportunityCard({
  opportunity,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
}: OpportunityCardProps) {
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
        return 'bg-destructive';
      case 'medium':
        return 'bg-warning';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const handleView = () => {
    if (opportunity.form_submission_id) {
      navigate(`/forms?submission=${opportunity.form_submission_id}`);
    }
  };

  return (
    <Card className="mb-3 hover:shadow-lg transition-all duration-200 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {getInitials(opportunity.patient_name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate">
                {opportunity.patient_name || 'Unknown Patient'}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {opportunity.case_type || 'General'}
              </p>
            </div>
          </div>
          {opportunity.priority && (
            <Badge 
              variant="secondary" 
              className={`h-2.5 w-2.5 rounded-full p-0 shrink-0 ${getPriorityColor(opportunity.priority)}`}
              aria-label={`Priority: ${opportunity.priority}`}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Value:</span>
            <span className="text-sm font-semibold">
              {formatCurrency(opportunity.estimated_value || 0)}
            </span>
          </div>
          
          {opportunity.source && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Source:</span>
              <Badge variant="secondary" className="text-xs">
                {opportunity.source}
              </Badge>
            </div>
          )}

          {(opportunity.patient_email || opportunity.patient_phone) && (
            <div className="pt-2 border-t">
              {opportunity.patient_email && (
                <p className="text-xs text-muted-foreground truncate">
                  {opportunity.patient_email}
                </p>
              )}
              {opportunity.patient_phone && (
                <p className="text-xs text-muted-foreground">
                  {opportunity.patient_phone}
                </p>
              )}
            </div>
          )}
        </div>

        <CardActions
          canMoveLeft={canMoveLeft}
          canMoveRight={canMoveRight}
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          onView={handleView}
          onEdit={onEdit}
          onDelete={onDelete}
          hasFormSubmission={!!opportunity.form_submission_id}
        />
      </CardContent>
    </Card>
  );
}
