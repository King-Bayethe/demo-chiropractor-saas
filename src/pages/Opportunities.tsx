import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, TrendingUp, DollarSign, Target, Loader2, Users, Calendar } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { MedicalOpportunityColumn } from '@/components/opportunities/MedicalOpportunityColumn';
import { AddMedicalOpportunityForm } from '@/components/opportunities/AddMedicalOpportunityForm';
import { MedicalOpportunityCard } from '@/components/opportunities/MedicalOpportunityCard';
import { useOpportunities, MEDICAL_PIPELINE_STAGES, Opportunity } from '@/hooks/useOpportunities';
import { getCaseTypeDisplayName } from '@/utils/patientMapping';

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

  const {
    opportunities,
    loading,
    error,
    createOpportunity,
    updateOpportunityStage,
    updateOpportunity,
    deleteOpportunity,
  } = useOpportunities();

  // Filter opportunities based on search and case type
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCaseType = selectedCaseType === 'All Cases' || 
      opp.case_type === selectedCaseType;

    return matchesSearch && matchesCaseType;
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

  const getOpportunitiesByStage = (stageId: string) => {
    return filteredOpportunities.filter(opp => opp.pipeline_stage === stageId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const opportunityId = active.id as string;
    const newStage = over.id as string;
    
    // Check if dropped on a valid stage column
    if (MEDICAL_PIPELINE_STAGES.some(stage => stage.id === newStage)) {
      try {
        await updateOpportunityStage(opportunityId, newStage);
      } catch (error) {
        console.error('Error updating opportunity stage:', error);
      }
    }
    
    setActiveId(null);
  };

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
          <div className="border-b bg-card/50 p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Medical Opportunities</h1>
                  <p className="text-muted-foreground">Track patient opportunities through your medical pipeline</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Opportunity
                  </Button>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Medical Opportunity</DialogTitle>
                    </DialogHeader>
                    <AddMedicalOpportunityForm 
                      onSubmit={handleAddOpportunity}
                      onCancel={() => setIsAddDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                        <p className="text-2xl font-bold">{metrics.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Estimated Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Converted Cases</p>
                        <p className="text-2xl font-bold">{metrics.converted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search opportunities, patients, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                  <SelectTrigger className="w-48">
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
                  <Badge variant="outline">
                    Showing {getCaseTypeDisplayName(selectedCaseType)} cases: {filteredOpportunities.length} opportunities
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-hidden">
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex h-full overflow-x-auto p-6 gap-6">
                <SortableContext 
                  items={MEDICAL_PIPELINE_STAGES.map(stage => stage.id)} 
                  strategy={horizontalListSortingStrategy}
                >
                  {MEDICAL_PIPELINE_STAGES.map(stage => (
                    <div key={stage.id} className="min-w-[320px]">
                      <MedicalOpportunityColumn
                        stage={stage}
                        opportunities={getOpportunitiesByStage(stage.id)}
                        onEdit={handleEditOpportunity}
                        onDelete={handleDeleteOpportunity}
                      />
                    </div>
                  ))}
                </SortableContext>
              </div>
              
              <DragOverlay>
                {activeId ? (
                  <MedicalOpportunityCard
                    opportunity={opportunities.find(o => o.id === activeId)!}
                    isDragging
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Medical Opportunity</DialogTitle>
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