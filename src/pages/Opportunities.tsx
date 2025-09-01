import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, TrendingUp, DollarSign, Target, Loader2, Users, Calendar, UserPlus, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { PipelineFlowHeader } from '@/components/opportunities/PipelineFlowHeader';
import { PipelineStageSummary } from '@/components/opportunities/PipelineStageSummary';
import { OpportunityListView } from '@/components/opportunities/OpportunityListView';
import { AddMedicalOpportunityForm } from '@/components/opportunities/AddMedicalOpportunityForm';
import { LeadIntakeForm } from '@/components/LeadIntakeForm';
import { useOpportunities, MEDICAL_PIPELINE_STAGES, Opportunity } from '@/hooks/useOpportunities';
import { getCaseTypeDisplayName } from '@/utils/patientMapping';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';

const CASE_TYPE_FILTERS = [
  'All Cases',
  'PIP',
  'Insurance', 
  'Slip and Fall',
  'Workers Compensation',
  'Cash Plan',
  'Attorney Only'
];

export default function Opportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('All Cases');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showLeadIntakeForm, setShowLeadIntakeForm] = useState(false);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const isMobile = useIsMobile();

  const {
    opportunities,
    loading,
    error,
    createOpportunity,
    updateOpportunityStage,
    updateOpportunity,
    moveOpportunityToPreviousStage,
    moveOpportunityToNextStage,
    deleteOpportunity,
    fetchOpportunities,
  } = useOpportunities();

  // Filter opportunities based on search, case type, and stage
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCaseType = selectedCaseType === 'All Cases' || 
      opp.case_type === selectedCaseType;

    const matchesStage = selectedStageFilter === 'all' || 
      opp.pipeline_stage === selectedStageFilter;

    return matchesSearch && matchesCaseType && matchesStage;
  });

  // Calculate metrics
  const metrics = {
    total: filteredOpportunities.length,
    totalValue: filteredOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0),
    converted: filteredOpportunities.filter(opp => opp.pipeline_stage === 'collection').length,
    conversionRate: filteredOpportunities.length > 0 
      ? Math.round((filteredOpportunities.filter(opp => opp.pipeline_stage === 'collection').length / filteredOpportunities.length) * 100)
      : 0,
  };

  // Pipeline flow data for header
  const pipelineFlowData = MEDICAL_PIPELINE_STAGES.map(stage => ({
    id: stage.id,
    title: stage.title,
    color: stage.color,
    count: opportunities.filter(opp => opp.pipeline_stage === stage.id).length,
  }));

  // Stage summary data for footer
  const stageSummaryData = MEDICAL_PIPELINE_STAGES.map(stage => {
    const count = opportunities.filter(opp => opp.pipeline_stage === stage.id).length;
    const percentage = opportunities.length > 0 ? Math.round((count / opportunities.length) * 100) : 0;
    return {
      id: stage.id,
      title: stage.title,
      color: stage.color,
      count,
      percentage,
    };
  });


  const handleAddOpportunity = async (data: any) => {
    try {
      await createOpportunity(data);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating opportunity:', error);
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOpportunity = async (data: any) => {
    if (!selectedOpportunity) return;
    
    try {
      await updateOpportunity(selectedOpportunity.id, data);
      setIsEditDialogOpen(false);
      setSelectedOpportunity(null);
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity(id);
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  const handleMoveToPrevious = async (id: string) => {
    const opportunity = opportunities.find(opp => opp.id === id);
    if (opportunity) {
      await moveOpportunityToPreviousStage(id, opportunity.pipeline_stage);
    }
  };

  const handleMoveToNext = async (id: string) => {
    const opportunity = opportunities.find(opp => opp.id === id);
    if (opportunity) {
      await moveOpportunityToNextStage(id, opportunity.pipeline_stage);
    }
  };

  const handleLeadIntakeSubmit = async (data: any) => {
    try {
      // Create/update patient with case type information
      const patientData = {
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        email: data.email || null,
        phone: data.phone || null,
        case_type: data.caseType || null,
        tags: data.caseType ? [data.caseType.toLowerCase().replace(/ /g, '-')] : [],
      };

      let patientId = null;

      // Try to find existing patient
      if (data.email || data.phone) {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .or(`email.eq.${data.email || ''},phone.eq.${data.phone || ''}`)
          .maybeSingle();

        if (existingPatient) {
          // Update existing patient
          await supabase
            .from('patients')
            .update(patientData)
            .eq('id', existingPatient.id);
          patientId = existingPatient.id;
        } else {
          // Create new patient
          const { data: newPatient } = await supabase
            .from('patients')
            .insert(patientData)
            .select('id')
            .single();
          patientId = newPatient?.id;
        }
      }

      // Compile medical history for notes
      const medicalNotes = [];
      if (data.currentSymptoms) medicalNotes.push(`Current Symptoms: ${data.currentSymptoms}`);
      if (data.painSeverity) medicalNotes.push(`Pain Severity: ${data.painSeverity}/10`);
      if (data.medicalHistory) medicalNotes.push(`Medical History: ${data.medicalHistory}`);
      if (data.previousTreatments) medicalNotes.push(`Previous Treatments: ${data.previousTreatments}`);
      if (data.currentMedications) medicalNotes.push(`Current Medications: ${data.currentMedications}`);

      // Create opportunity directly in "lead" stage
      const opportunityData = {
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Lead',
        patient_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        patient_email: data.email || null,
        patient_phone: data.phone || null,
        case_type: data.caseType || null,
        attorney_name: data.referredBy || null,
        source: 'Lead Intake Form',
        pipeline_stage: 'lead', // Directly into "New Lead" stage
        notes: medicalNotes.join('\n\n'),
        patient_id: patientId,
        status: 'lead',
      };

      await createOpportunity(opportunityData);

      toast.success("Lead created successfully and added to pipeline");
      setShowLeadIntakeForm(false);
      
      // Refresh opportunities to show new lead
      await fetchOpportunities();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error("Failed to create lead");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading opportunities...</span>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="border-b bg-card/50 p-3 md:p-6">
            <div className="flex flex-col space-y-3 md:space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-3xl font-bold tracking-tight break-words">Medical Pipeline</h1>
                  <p className="text-sm md:text-base text-muted-foreground">Track patients through your medical pipeline</p>
                </div>
                <Button 
                  onClick={() => setShowLeadIntakeForm(true)}
                  className="bg-orange-500 hover:bg-orange-600 w-full md:w-auto"
                  size={isMobile ? "sm" : "default"}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Lead Intake
                </Button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Pipeline</p>
                        <p className="text-lg md:text-2xl font-bold">{metrics.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Est. Value</p>
                        <p className="text-sm md:text-2xl font-bold break-words">{formatCurrency(metrics.totalValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Converted</p>
                        <p className="text-lg md:text-2xl font-bold">{metrics.converted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Conv. Rate</p>
                        <p className="text-lg md:text-2xl font-bold">{metrics.conversionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search pipeline, patients, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by case type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    {CASE_TYPE_FILTERS.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Case Type Summary */}
              {selectedCaseType !== 'All Cases' && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="break-words">
                    Showing {getCaseTypeDisplayName(selectedCaseType)} cases: {filteredOpportunities.length} pipeline entries
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Flow Header */}
          <div className="px-3 md:px-6">
            <PipelineFlowHeader stages={pipelineFlowData} />
          </div>

          {/* Opportunity List */}
          <div className="flex-1 px-3 md:px-6 py-4">
            <OpportunityListView
              opportunities={filteredOpportunities}
              selectedStage={selectedStageFilter}
              onStageChange={setSelectedStageFilter}
              onEdit={handleEditOpportunity}
              onDelete={handleDeleteOpportunity}
              onMoveToPrevious={handleMoveToPrevious}
              onMoveToNext={handleMoveToNext}
              onUpdateStage={updateOpportunityStage}
            />
          </div>

          {/* Pipeline Stage Summary */}
          <div className="px-3 md:px-6 pb-4">
            <PipelineStageSummary 
              stages={stageSummaryData} 
              totalOpportunities={opportunities.length} 
            />
          </div>
        </div>

        {/* Lead Intake Form Dialog */}
        <Dialog open={showLeadIntakeForm} onOpenChange={setShowLeadIntakeForm}>
          <DialogContent className={cn("max-h-[90vh] overflow-y-auto", isMobile ? "max-w-[95vw] mx-2" : "max-w-4xl")}>
            <DialogHeader>
              <DialogTitle>New Lead Intake Form</DialogTitle>
            </DialogHeader>
            <LeadIntakeForm 
              onSubmit={handleLeadIntakeSubmit}
              onCancel={() => setShowLeadIntakeForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className={cn("max-h-[90vh] overflow-y-auto", isMobile ? "max-w-[95vw] mx-2" : "max-w-4xl")}>
            <DialogHeader>
              <DialogTitle>Edit Medical Pipeline Entry</DialogTitle>
            </DialogHeader>
            {selectedOpportunity && (
              <AddMedicalOpportunityForm 
                onSubmit={handleUpdateOpportunity}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedOpportunity(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Layout>
    </AuthGuard>
  );
}