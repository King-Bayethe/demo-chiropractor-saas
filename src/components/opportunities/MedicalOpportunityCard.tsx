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
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Opportunity, MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';
import { getCaseTypeVariant, getCaseTypeDisplayName } from '@/utils/patientMapping';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MedicalOpportunityCardProps {
  opportunity: Opportunity;
  isDragging?: boolean;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
  onMoveToPrevious?: (id: string, currentStage: string) => void;
  onMoveToNext?: (id: string, currentStage: string) => void;
}

export function MedicalOpportunityCard({ 
  opportunity, 
  isDragging, 
  onEdit, 
  onDelete, 
  onMoveToPrevious, 
  onMoveToNext 
}: MedicalOpportunityCardProps) {
  const isMobile = useIsMobile();
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

  const currentStageIndex = MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === opportunity.pipeline_stage);
  const canMovePrevious = currentStageIndex > 0;
  const canMoveNext = currentStageIndex < MEDICAL_PIPELINE_STAGES.length - 1;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0",
        isDragging && "opacity-50 rotate-2"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className={cn("flex-shrink-0", isMobile ? "h-6 w-6" : "h-8 w-8")}>
              <AvatarFallback className={cn(isMobile ? "text-xs" : "text-xs")}>
                {getInitials(opportunity.patient_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className={cn("font-semibold truncate", isMobile ? "text-xs" : "text-sm")}>
                {opportunity.name?.replace(/^Appointment\s*-\s*/, '') || opportunity.name}
              </h4>
              <p className={cn("text-muted-foreground truncate", isMobile ? "text-xs" : "text-xs")}>
                {opportunity.patient_name}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {/* Mobile: Show only dropdown for actions */}
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                  {canMovePrevious && onMoveToPrevious && (
                    <DropdownMenuItem onClick={() => onMoveToPrevious(opportunity.id, opportunity.pipeline_stage)}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Move to {MEDICAL_PIPELINE_STAGES[currentStageIndex - 1]?.title}
                    </DropdownMenuItem>
                  )}
                  {canMoveNext && onMoveToNext && (
                    <DropdownMenuItem onClick={() => onMoveToNext(opportunity.id, opportunity.pipeline_stage)}>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Move to {MEDICAL_PIPELINE_STAGES[currentStageIndex + 1]?.title}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit?.(opportunity)}>
                    Edit Opportunity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(opportunity.id)} className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Desktop: Show individual buttons */
              <>
                {/* Navigation arrows */}
                {canMovePrevious && onMoveToPrevious && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => onMoveToPrevious(opportunity.id, opportunity.pipeline_stage)}
                    title={`Move to ${MEDICAL_PIPELINE_STAGES[currentStageIndex - 1]?.title}`}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                )}
                
                {canMoveNext && onMoveToNext && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => onMoveToNext(opportunity.id, opportunity.pipeline_stage)}
                    title={`Move to ${MEDICAL_PIPELINE_STAGES[currentStageIndex + 1]?.title}`}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
                
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
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0 space-y-2", isMobile ? "space-y-1" : "space-y-2")}>
        {/* Case Type & Attorney Status */}
        <div className="flex gap-1 flex-wrap">
          {opportunity.case_type && (
            <Badge variant="outline" className={cn("text-xs", getCaseTypeVariant(opportunity.case_type))}>
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
          <div className={cn(isMobile ? "space-y-0.5" : "space-y-1")}>
            {opportunity.patient_email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate break-all">{opportunity.patient_email}</span>
              </div>
            )}
            {opportunity.patient_phone && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="break-all">{opportunity.patient_phone}</span>
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
          <div className={cn("text-xs text-muted-foreground bg-muted/50 p-2 rounded break-words", isMobile ? "text-xs" : "text-xs")}>
            {opportunity.notes.length > (isMobile ? 40 : 60)
              ? `${opportunity.notes.slice(0, isMobile ? 40 : 60)}...` 
              : opportunity.notes
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}