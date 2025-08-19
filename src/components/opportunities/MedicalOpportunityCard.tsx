import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  GripVertical, 
  MoreHorizontal, 
  Phone, 
  User,
  Scale,
  Clock,
  Mail
} from 'lucide-react';
import { Opportunity } from '@/hooks/useOpportunities';
import { getCaseTypeVariant, getCaseTypeDisplayName } from '@/utils/patientMapping';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MedicalOpportunityCardProps {
  opportunity: Opportunity;
  isDragging?: boolean;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
}

export function MedicalOpportunityCard({ opportunity, isDragging, onEdit, onDelete }: MedicalOpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: opportunity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(opportunity.patient_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {opportunity.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {opportunity.patient_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                <DropdownMenuItem onClick={() => onEdit?.(opportunity)}>
                  Edit Opportunity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(opportunity.id)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2">
        {/* Case Type & Attorney Status */}
        <div className="flex gap-1 flex-wrap">
          {opportunity.case_type && (
            <Badge variant="outline" className={`text-xs ${getCaseTypeVariant(opportunity.case_type)}`}>
              {getCaseTypeDisplayName(opportunity.case_type)}
            </Badge>
          )}
          {opportunity.attorney_referred && (
            <Badge variant="outline" className="text-xs">
              <Scale className="h-3 w-3 mr-1" />
              Attorney
            </Badge>
          )}
        </div>

        {/* Contact Information */}
        {(opportunity.patient_email || opportunity.patient_phone) && (
          <div className="space-y-1">
            {opportunity.patient_email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{opportunity.patient_email}</span>
              </div>
            )}
            {opportunity.patient_phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{opportunity.patient_phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Value Information */}
        {(opportunity.estimated_value || opportunity.insurance_coverage_amount) && (
          <div className="space-y-1">
            {opportunity.estimated_value && (
              <div className="flex items-center gap-1 text-xs">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="font-medium">
                  {formatCurrency(opportunity.estimated_value)}
                </span>
                <span className="text-muted-foreground">Est. Value</span>
              </div>
            )}
            {opportunity.insurance_coverage_amount && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Insurance: {formatCurrency(opportunity.insurance_coverage_amount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1">
          {opportunity.expected_close_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Close: {formatDate(opportunity.expected_close_date)}</span>
            </div>
          )}
          {opportunity.consultation_scheduled_at && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Consult: {formatDate(opportunity.consultation_scheduled_at)}</span>
            </div>
          )}
        </div>

        {/* Assigned Provider */}
        {opportunity.assigned_provider_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Assigned: {opportunity.assigned_provider_name}</span>
          </div>
        )}

        {/* Source */}
        {opportunity.source && (
          <div className="text-xs text-muted-foreground">
            Source: {opportunity.source}
          </div>
        )}

        {/* Notes Preview */}
        {opportunity.notes && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {opportunity.notes.length > 60 
              ? `${opportunity.notes.slice(0, 60)}...` 
              : opportunity.notes
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}