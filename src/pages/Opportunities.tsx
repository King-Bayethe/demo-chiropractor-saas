import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Target, Settings, Plus, Filter, X, Search, ChevronsLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { KanbanOpportunityCard } from "@/components/pipeline/KanbanOpportunityCard";
import { PipelineSelector } from "@/components/opportunities/PipelineSelector";
import { usePipelineStages, usePipelineOpportunities, usePipelineStats, usePipelineMutations } from "@/hooks/usePipeline";
import { usePipelines } from "@/hooks/usePipelines";
import { cn } from "@/lib/utils";

export default function Opportunities() {
  const navigate = useNavigate();
  const { pipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');

  // Set default pipeline once loaded
  useEffect(() => {
    if (!selectedPipelineId && pipelines.length > 0) {
      const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
      setSelectedPipelineId(defaultPipeline.id);
    }
  }, [pipelines, selectedPipelineId]);

  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages(selectedPipelineId);
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = usePipelineOpportunities();
  
  // Filter opportunities by selected pipeline
  const pipelineOpportunities = allOpportunities.filter(opp => opp.pipeline_id === selectedPipelineId);
  
  const { stats, stageStats } = usePipelineStats(selectedPipelineId);
  const { updateOpportunityStage } = usePipelineMutations(selectedPipelineId);

  // Apply filters
  const opportunities = useMemo(() => {
    return pipelineOpportunities.filter(opp => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          opp.patient_name?.toLowerCase().includes(searchLower) ||
          opp.name?.toLowerCase().includes(searchLower) ||
          opp.patient_email?.toLowerCase().includes(searchLower) ||
          opp.patient_phone?.includes(searchTerm);
        if (!matchesSearch) return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && opp.priority !== priorityFilter) {
        return false;
      }
      
      // Value filter
      if (valueFilter !== 'all') {
        const value = opp.estimated_value || 0;
        if (valueFilter === '0-1000' && value >= 1000) return false;
        if (valueFilter === '1000-5000' && (value < 1000 || value >= 5000)) return false;
        if (valueFilter === '5000+' && value < 5000) return false;
      }
      
      return true;
    });
  }, [pipelineOpportunities, searchTerm, priorityFilter, valueFilter]);

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    priorityFilter !== 'all' ? 1 : 0,
    valueFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const getStageColor = (color: string) => {
    const colorMap: Record<string, string> = {
      '#ef4444': 'bg-red-500 border-red-200',
      '#f97316': 'bg-orange-500 border-orange-200', 
      '#eab308': 'bg-yellow-500 border-yellow-200',
      '#3b82f6': 'bg-blue-500 border-blue-200',
      '#8b5cf6': 'bg-violet-500 border-violet-200',
      '#06b6d4': 'bg-cyan-500 border-cyan-200',
      '#10b981': 'bg-emerald-500 border-emerald-200',
    };
    return colorMap[color] || 'bg-gray-500 border-gray-200';
  };

  const handleMoveOpportunity = (opportunityId: string, direction: 'left' | 'right') => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const currentStageIndex = stages.findIndex(stage => stage.id === opportunity.pipeline_stage);
    if (currentStageIndex === -1) return;

    let targetStageIndex;
    if (direction === 'left' && currentStageIndex > 0) {
      targetStageIndex = currentStageIndex - 1;
    } else if (direction === 'right' && currentStageIndex < stages.length - 1) {
      targetStageIndex = currentStageIndex + 1;
    } else {
      return;
    }

    const targetStage = stages[targetStageIndex];
    updateOpportunityStage.mutate({ id: opportunityId, stageId: targetStage.id });
  };

  if (stagesLoading || opportunitiesLoading || !selectedPipelineId) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-shimmer" />
              <div className="h-4 w-64 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-shimmer" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-muted mb-4" />
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-8 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-28 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Kanban Skeleton */}
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-80 flex-shrink-0">
                <Card className="mb-3 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <Card key={j} className="animate-pulse">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted" />
                          <div className="h-4 w-32 bg-muted rounded" />
                        </div>
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Modern Hero Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          
          <div className="relative px-6 py-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              {/* Left: Title & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patient Pipeline</h1>
                    <p className="text-muted-foreground">
                      Track {stats.totalOpportunities} opportunities worth ${stats.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right: Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <PipelineSelector
                  selectedPipelineId={selectedPipelineId}
                  onSelectPipeline={setSelectedPipelineId}
                />
                
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                <Button variant="outline" onClick={() => navigate('/pipeline-management')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card className="mx-6 -mt-4 mb-6 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="md:col-span-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search opportunities..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Priority Filter */}
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Value Range Filter */}
                  <Select value={valueFilter} onValueChange={setValueFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Values" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Values</SelectItem>
                      <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000+">$5,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
          {/* Total Pipeline Value */}
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pipeline Value</p>
                <h3 className="text-3xl font-bold">${stats.totalValue.toLocaleString()}</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.totalOpportunities} active opportunities
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Average Deal Size */}
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-success" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Deal Size</p>
                <h3 className="text-3xl font-bold">${Math.round(stats.averageDealSize).toLocaleString()}</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Lifetime value estimate
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Conversion Rate */}
          <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <h3 className="text-3xl font-bold">
                  {stats.totalOpportunities > 0 
                    ? Math.round((stageStats.find(s => s.position === 7)?.count || 0) / stats.totalOpportunities * 100)
                    : 0}%
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  To completed care
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Prospects */}
          <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Prospects</p>
                <h3 className="text-3xl font-bold">{stats.activeContacts}</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Potential patients
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board - No gray background, modern design */}
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Target className="h-16 w-16 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-bounce">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">No Opportunities Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start tracking patient opportunities by adding your first one to the pipeline.
              You can move them through stages as they progress.
            </p>
            
            <div className="flex gap-3">
              <Button onClick={() => navigate('/pipeline-management')}>
                <Settings className="mr-2 h-4 w-4" />
                Configure Pipeline
              </Button>
            </div>
            
            <Card className="mt-8 max-w-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Quick Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      Opportunities are automatically created when patients submit intake forms.
                      You can also manually add them here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="relative">
              {/* Horizontal scroll container with gradient fade indicators */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="flex gap-4 min-w-max">
                  {stages.map((stage, stageIndex) => {
                    const stageOpportunities = opportunities.filter(
                      opp => opp.pipeline_stage === stage.id
                    );
                    const totalValue = stageOpportunities.reduce(
                      (sum, opp) => sum + (opp.estimated_value || 0), 0
                    );
                    const isCollapsed = collapsedStages.includes(stage.id);
                    
                    return (
                      <div 
                        key={stage.id} 
                        className={cn(
                          "flex-shrink-0 transition-all duration-300",
                          isCollapsed ? "w-16" : "w-80"
                        )}
                      >
                        {/* Stage Header - Modern Design */}
                        <Card className="mb-3 overflow-hidden border-t-4" style={{ borderTopColor: stage.color }}>
                          <CardHeader className="p-4 bg-gradient-to-br from-muted/50 to-background">
                            <div className="flex items-center justify-between">
                              {!isCollapsed && (
                                <>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-semibold text-sm">{stage.title}</h3>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs font-bold"
                                        style={{ 
                                          backgroundColor: `${stage.color}20`,
                                          color: stage.color 
                                        }}
                                      >
                                        {stageOpportunities.length}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">Total Value</span>
                                      <span className="font-semibold text-foreground">
                                        ${totalValue.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Collapse Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 ml-2"
                                    onClick={() => toggleStageCollapse(stage.id)}
                                  >
                                    <ChevronsLeft className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              {isCollapsed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 mx-auto rotate-90"
                                  onClick={() => toggleStageCollapse(stage.id)}
                                >
                                  <span className="text-xs font-bold">
                                    {stageOpportunities.length}
                                  </span>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                        
                        {/* Opportunities Column - Only show when not collapsed */}
                        {!isCollapsed && (
                          <ScrollArea className="h-[600px]">
                            <div className="space-y-2 pr-2">
                              {stageOpportunities.map((opportunity) => (
                                <KanbanOpportunityCard
                                  key={opportunity.id}
                                  opportunity={opportunity}
                                  canMoveLeft={stageIndex > 0}
                                  canMoveRight={stageIndex < stages.length - 1}
                                  onMoveLeft={() => handleMoveOpportunity(opportunity.id, 'left')}
                                  onMoveRight={() => handleMoveOpportunity(opportunity.id, 'right')}
                                />
                              ))}
                              
                              {stageOpportunities.length === 0 && (
                                <Card className="border-dashed border-2 bg-muted/20">
                                  <CardContent className="p-8 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                        <Plus className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        No opportunities
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Scroll Fade Indicators */}
              <div className="pointer-events-none absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background to-transparent" />
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
          {/* Quick Actions Menu */}
          {showQuickActions && (
            <Card className="animate-slide-up shadow-xl">
              <CardContent className="p-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate('/pipeline-management')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Pipeline
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Main FAB */}
          <Button 
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            {showQuickActions ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}