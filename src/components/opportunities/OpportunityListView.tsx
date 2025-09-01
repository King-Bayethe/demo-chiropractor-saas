import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Phone, Mail, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Opportunity, MEDICAL_PIPELINE_STAGES } from '@/hooks/useOpportunities';
import { getCaseTypeDisplayName } from '@/utils/patientMapping';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-breakpoints';

interface OpportunityListViewProps {
  opportunities: Opportunity[];
  selectedStage?: string;
  onStageChange: (stage: string) => void;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (id: string) => void;
  onMoveToPrevious: (id: string) => void;
  onMoveToNext: (id: string) => void;
  onUpdateStage: (id: string, stage: string) => void;
}

export function OpportunityListView({
  opportunities,
  selectedStage,
  onStageChange,
  onEdit,
  onDelete,
  onMoveToPrevious,
  onMoveToNext,
  onUpdateStage,
}: OpportunityListViewProps) {
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCurrentStageIndex = (stageId: string) => {
    return MEDICAL_PIPELINE_STAGES.findIndex(stage => stage.id === stageId);
  };

  const canMoveToPrevious = (stageId: string) => {
    return getCurrentStageIndex(stageId) > 0;
  };

  const canMoveToNext = (stageId: string) => {
    return getCurrentStageIndex(stageId) < MEDICAL_PIPELINE_STAGES.length - 1;
  };

  return (
    <div className="space-y-4">
      {/* Stage Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filter by stage:</span>
        <Select value={selectedStage || 'all'} onValueChange={onStageChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {MEDICAL_PIPELINE_STAGES.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                  {stage.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No opportunities found for the selected criteria.</p>
            </CardContent>
          </Card>
        ) : (
          opportunities.map(opportunity => {
            const currentStage = MEDICAL_PIPELINE_STAGES.find(stage => stage.id === opportunity.pipeline_stage);
            
            return (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(opportunity.patient_name || opportunity.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {opportunity.patient_name || opportunity.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {currentStage && (
                              <Badge variant="outline" className="text-xs">
                                <div className={cn("w-2 h-2 rounded-full mr-1", currentStage.color)} />
                                {currentStage.title}
                              </Badge>
                            )}
                            {opportunity.case_type && (
                              <Badge variant="secondary" className="text-xs">
                                {getCaseTypeDisplayName(opportunity.case_type)}
                              </Badge>
                            )}
                            {opportunity.estimated_value && (
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(opportunity.estimated_value)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Contact Info */}
                          <div className="flex items-center gap-1">
                            {opportunity.patient_phone && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            {opportunity.patient_email && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Stage Navigation */}
                          {!isMobile && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveToPrevious(opportunity.id)}
                                disabled={!canMoveToPrevious(opportunity.pipeline_stage)}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveToNext(opportunity.id)}
                                disabled={!canMoveToNext(opportunity.pipeline_stage)}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {isMobile && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onMoveToPrevious(opportunity.id)}
                                    disabled={!canMoveToPrevious(opportunity.pipeline_stage)}
                                  >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Move to Previous Stage
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onMoveToNext(opportunity.id)}
                                    disabled={!canMoveToNext(opportunity.pipeline_stage)}
                                  >
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                    Move to Next Stage
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => onDelete(opportunity.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {opportunity.source && (
                          <span>Source: {opportunity.source} • </span>
                        )}
                        <span>Last updated: {formatDate(opportunity.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}