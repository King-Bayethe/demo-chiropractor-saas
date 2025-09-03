import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Eye
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
  compact?: boolean;
}

export function MedicalOpportunityCard({ 
  opportunity, 
  isDragging, 
  onEdit, 
  onDelete, 
  onMoveToPrevious, 
  onMoveToNext,
  compact = false
}: MedicalOpportunityCardProps) {
  const [isOpen, setIsOpen] = useState(!compact);
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

  // Calculate lead age and get color-coded styling
  const getLeadAge = () => {
    if (!opportunity.created_at) return { days: 0, color: '', urgencyLevel: 'new' };
    
    const createdDate = new Date(opportunity.created_at);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - createdDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let color = '';
    let urgencyLevel = '';
    
    if (days <= 2) {
      color = 'border-l-green-500';
      urgencyLevel = 'new';
    } else if (days <= 4) {
      color = 'border-l-yellow-500';
      urgencyLevel = 'moderate';
    } else if (days <= 7) {
      color = 'border-l-red-500';
      urgencyLevel = 'urgent';
    } else {
      color = 'border-l-red-700';
      urgencyLevel = 'overdue';
    }
    
    return { days, color, urgencyLevel };
  };

  const leadAge = getLeadAge();

  // Get form type display information
  const getFormTypeInfo = () => {
    if (!opportunity.form_submission_id) return null;
    
    let formType = 'Unknown Form';
    let icon = FileText;
    
    // Determine form type based on source or other indicators
    if (opportunity.source?.toLowerCase().includes('pip')) {
      formType = 'PIP Form';
    } else if (opportunity.source?.toLowerCase().includes('cash')) {
      formType = 'Cash Form';
    } else if (opportunity.source?.toLowerCase().includes('lop')) {
      formType = 'LOP Form';
    } else {
      formType = 'Form Submission';
    }
    
    return { formType, icon };
  };

  const formInfo = getFormTypeInfo();

  const currentStageIndex = MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === opportunity.pipeline_stage);
  const canMovePrevious = currentStageIndex > 0;
  const canMoveNext = currentStageIndex < MEDICAL_PIPELINE_STAGES.length - 1;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 border-l-4",
          leadAge.color,
          isDragging && "opacity-50 rotate-2",
          compact && "text-xs"
        )}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className={cn(compact ? "pb-1 px-2 py-1.5" : "pb-2", "cursor-pointer hover:bg-muted/50")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className={cn(
                  "flex-shrink-0", 
                  compact ? "h-5 w-5" : isMobile ? "h-6 w-6" : "h-8 w-8"
                )}>
                  <AvatarFallback className={cn(
                    compact ? "text-xs" : isMobile ? "text-xs" : "text-xs"
                  )}>
                    {getInitials(opportunity.patient_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-semibold truncate", 
                    compact ? "text-xs" : isMobile ? "text-xs" : "text-sm"
                  )}>
                    {opportunity.name?.replace(/^Appointment\s*-\s*/, '') || opportunity.name}
                  </h4>
                  {opportunity.case_type ? (
                    <Badge variant="outline" className={cn(
                      "text-xs w-fit", 
                      getCaseTypeVariant(opportunity.case_type)
                    )}>
                      {getCaseTypeDisplayName(opportunity.case_type)}
                    </Badge>
                  ) : (
                    <p className={cn(
                      "text-muted-foreground truncate", 
                      compact ? "text-xs" : isMobile ? "text-xs" : "text-xs"
                    )}>
                      {opportunity.patient_name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Collapse/Expand Indicator and Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {/* Collapse indicator */}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                  {isOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                
                {/* Action Buttons */}
                {/* Mobile: Show only dropdown for actions */}
                {isMobile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToPrevious(opportunity.id, opportunity.pipeline_stage);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToNext(opportunity.id, opportunity.pipeline_stage);
                        }}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
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
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className={cn(
            "pt-0", 
            compact ? "px-2 pb-1.5 space-y-1" : "space-y-2",
            isMobile && !compact ? "space-y-1" : ""
          )}>
            {/* Contact Information - Always visible when expanded */}
            {(opportunity.patient_email || opportunity.patient_phone || opportunity.patient_name) && (
              <div className="border-b border-border/50 pb-2 mb-2">
                <h5 className="text-xs font-medium text-foreground mb-1.5">Contact Information</h5>
                <div className={cn(isMobile ? "space-y-1" : "space-y-1.5")}>
                  {opportunity.patient_name && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <span className="font-medium">{opportunity.patient_name}</span>
                    </div>
                  )}
                  {opportunity.patient_phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <a 
                        href={`tel:${opportunity.patient_phone}`}
                        className="text-primary hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {opportunity.patient_phone}
                      </a>
                    </div>
                  )}
                  {opportunity.patient_email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <a 
                        href={`mailto:${opportunity.patient_email}`}
                        className="text-primary hover:underline truncate break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {opportunity.patient_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source & Case Details */}
            <div className="border-b border-border/50 pb-2 mb-2">
              <h5 className="text-xs font-medium text-foreground mb-1.5">Case Details</h5>
              <div className="space-y-1.5">
                {opportunity.source && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Source:</span>
                    <span>{opportunity.form_submission_id ? `Form: ${opportunity.source} (#${opportunity.form_submission_id})` : opportunity.source}</span>
                  </div>
                )}
                
                {/* Form Submission Button */}
                {formInfo && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to forms page or open modal - implement based on your routing
                        console.log('View form submission:', opportunity.form_submission_id);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View {formInfo.formType}
                    </Button>
                  </div>
                )}
                
                {opportunity.attorney_referred && (
                  <div className="flex items-center gap-2 text-xs">
                    <Scale className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      Attorney Referred
                    </Badge>
                  </div>
                )}
                {opportunity.referral_source && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Referral:</span>
                    <span>{opportunity.referral_source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            {(opportunity.estimated_value || opportunity.insurance_coverage_amount) && (
              <div className="border-b border-border/50 pb-2 mb-2">
                <h5 className="text-xs font-medium text-foreground mb-1.5">Financial Overview</h5>
                <div className="space-y-1.5">
                  {opportunity.estimated_value && (
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 flex-shrink-0 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(opportunity.estimated_value)}
                      </span>
                      <span className="text-muted-foreground">Est. Value</span>
                    </div>
                  )}
                  {opportunity.insurance_coverage_amount && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Insurance:</span>
                      <span className="font-medium">{formatCurrency(opportunity.insurance_coverage_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lead Age & Status */}
            <div className="border-b border-border/50 pb-2 mb-2">
              <h5 className="text-xs font-medium text-foreground mb-1.5">Lead Age & Status</h5>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium">{leadAge.days} day{leadAge.days !== 1 ? 's' : ''} old</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs ml-1",
                      leadAge.urgencyLevel === 'new' && "border-green-200 text-green-700 bg-green-50",
                      leadAge.urgencyLevel === 'moderate' && "border-yellow-200 text-yellow-700 bg-yellow-50", 
                      leadAge.urgencyLevel === 'urgent' && "border-red-200 text-red-700 bg-red-50",
                      leadAge.urgencyLevel === 'overdue' && "border-red-300 text-red-800 bg-red-100"
                    )}
                  >
                    {leadAge.urgencyLevel === 'new' && 'New'}
                    {leadAge.urgencyLevel === 'moderate' && 'Follow Up'}
                    {leadAge.urgencyLevel === 'urgent' && 'Urgent'}
                    {leadAge.urgencyLevel === 'overdue' && 'Overdue'}
                  </Badge>
                </div>
                
                {opportunity.consultation_scheduled_at && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Consultation:</span>
                    <span>{formatDate(opportunity.consultation_scheduled_at)}</span>
                  </div>
                )}
                {opportunity.treatment_start_date && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Treatment Start:</span>
                    <span>{formatDate(opportunity.treatment_start_date)}</span>
                  </div>
                )}
                {opportunity.expected_close_date && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Expected Close:</span>
                    <span>{formatDate(opportunity.expected_close_date)}</span>
                  </div>
                )}
                {opportunity.last_contact_date && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Last Contact:</span>
                    <span>{formatDate(opportunity.last_contact_date)}</span>
                  </div>
                )}
                {opportunity.next_follow_up_date && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Next Follow-up:</span>
                    <span>{formatDate(opportunity.next_follow_up_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment & Management */}
            {(opportunity.assigned_provider_name || opportunity.notes) && (
              <div>
                <h5 className="text-xs font-medium text-foreground mb-1.5">Assignment & Notes</h5>
                <div className="space-y-1.5">
                  {opportunity.assigned_provider_name && (
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned:</span>
                      <span>{opportunity.assigned_provider_name}</span>
                    </div>
                  )}
                  {opportunity.notes && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded break-words">
                      <span className="font-medium">Notes: </span>
                      {opportunity.notes.length > (isMobile ? 60 : 100)
                        ? `${opportunity.notes.slice(0, isMobile ? 60 : 100)}...` 
                        : opportunity.notes
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}