import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Phone, Mail, Calendar, Users, DollarSign } from "lucide-react";
import { useGHLApi } from "@/hooks/useGHLApi";
import { toast } from "sonner";
import { OpportunityColumn } from "@/components/opportunities/OpportunityColumn";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { AddOpportunityForm } from "@/components/opportunities/AddOpportunityForm";

export interface Opportunity {
  id: string;
  name: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  monetaryValue?: number;
  status: string;
  assignedTo?: string;
  source?: string;
  lastActivity?: string;
  tags?: string[];
  notes?: string;
  createdAt?: string;
}

const PIPELINE_STAGES = [
  { id: "lead", title: "Lead Captured", color: "bg-blue-100 text-blue-800" },
  { id: "consultation", title: "Consult Scheduled", color: "bg-yellow-100 text-yellow-800" },
  { id: "seen", title: "Patient Seen", color: "bg-green-100 text-green-800" },
  { id: "billing", title: "Billing Pending", color: "bg-orange-100 text-orange-800" },
  { id: "payment", title: "Payment Collected", color: "bg-emerald-100 text-emerald-800" },
];

const PIPELINES = [
  { id: "sales", name: "Sales Process" },
  { id: "medical", name: "Medical Pipeline" },
  { id: "billing", name: "Billing Pipeline" },
];

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState("sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    converted: 0,
    totalValue: 0,
  });

  const ghlApi = useGHLApi();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await ghlApi.opportunities.getAll();
      
      // Transform GHL data to our format
      const transformedOpportunities: Opportunity[] = (response?.opportunities || []).map((opp: any) => ({
        id: opp.id || `opp-${Math.random()}`,
        name: opp.name || opp.contact?.name || "Unknown Contact",
        contact: {
          name: opp.contact?.name,
          phone: opp.contact?.phone,
          email: opp.contact?.email,
        },
        monetaryValue: opp.monetaryValue || 0,
        status: mapGHLStatusToStage(opp.status),
        assignedTo: opp.assignedTo?.name,
        source: opp.source,
        lastActivity: opp.lastStatusChangeAt || opp.dateAdded,
        tags: opp.tags || [],
        notes: opp.notes,
        createdAt: opp.dateAdded,
      }));

      setOpportunities(transformedOpportunities);
      calculateMetrics(transformedOpportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
      // Set mock data for development
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockOpportunities: Opportunity[] = [
      {
        id: "1",
        name: "John Smith",
        contact: { name: "John Smith", phone: "+1234567890", email: "john@email.com" },
        monetaryValue: 5000,
        status: "lead",
        assignedTo: "Dr. Silverman",
        source: "Attorney Referral",
        lastActivity: "2024-01-15",
        tags: ["Personal Injury", "High Priority"],
      },
      {
        id: "2",
        name: "Sarah Johnson",
        contact: { name: "Sarah Johnson", phone: "+1987654321", email: "sarah@email.com" },
        monetaryValue: 8000,
        status: "consultation",
        assignedTo: "Dr. Silverman",
        source: "Website",
        lastActivity: "2024-01-14",
        tags: ["Workers Comp"],
      },
      {
        id: "3",
        name: "Mike Wilson",
        contact: { name: "Mike Wilson", phone: "+1122334455", email: "mike@email.com" },
        monetaryValue: 12000,
        status: "seen",
        assignedTo: "Dr. Silverman",
        source: "Attorney Referral",
        lastActivity: "2024-01-13",
        tags: ["Auto Accident", "Treatment Complete"],
      },
    ];
    setOpportunities(mockOpportunities);
    calculateMetrics(mockOpportunities);
  };

  const mapGHLStatusToStage = (status: string): string => {
    const statusMap: Record<string, string> = {
      "open": "lead",
      "won": "payment",
      "lost": "lead",
      "abandoned": "lead",
    };
    return statusMap[status?.toLowerCase()] || "lead";
  };

  const filterOpportunities = () => {
    let filtered = opportunities;
    
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredOpportunities(filtered);
  };

  const calculateMetrics = (opps: Opportunity[]) => {
    const total = opps.length;
    const converted = opps.filter(o => o.status === "payment").length;
    const totalValue = opps.reduce((sum, o) => sum + (o.monetaryValue || 0), 0);
    
    setMetrics({ total, converted, totalValue });
  };

  const getOpportunitiesByStage = (stage: string) => {
    return filteredOpportunities.filter(opp => opp.status === stage);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const opportunityId = active.id as string;
    const newStage = over.id as string;
    
    // Check if dropped on a stage column
    if (PIPELINE_STAGES.some(stage => stage.id === newStage)) {
      updateOpportunityStage(opportunityId, newStage);
    }
    
    setActiveId(null);
  };

  const updateOpportunityStage = async (opportunityId: string, newStage: string) => {
    try {
      // Update locally first for immediate feedback
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, status: newStage, lastActivity: new Date().toISOString() }
          : opp
      ));
      
      // TODO: Update via GHL API
      toast.success("Opportunity status updated");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Failed to update opportunity");
      // Revert changes
      fetchOpportunities();
    }
  };

  const handleAddOpportunity = async (data: any) => {
    try {
      // TODO: Create via GHL API
      const newOpportunity: Opportunity = {
        id: `new-${Date.now()}`,
        name: data.name,
        contact: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        monetaryValue: data.value || 0,
        status: data.stage || "lead",
        assignedTo: data.assignedTo,
        source: data.source,
        tags: data.tags?.split(",").map((tag: string) => tag.trim()) || [],
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      setOpportunities(prev => [...prev, newOpportunity]);
      setIsAddDialogOpen(false);
      toast.success("Opportunity added successfully");
    } catch (error) {
      console.error("Error adding opportunity:", error);
      toast.error("Failed to add opportunity");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Opportunity</DialogTitle>
                </DialogHeader>
                <AddOpportunityForm onSubmit={handleAddOpportunity} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Opportunities</p>
                    <p className="text-2xl font-bold">{metrics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Value</p>
                    <p className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Converted</p>
                    <p className="text-2xl font-bold">{metrics.converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold">
                      {metrics.total > 0 ? Math.round((metrics.converted / metrics.total) * 100) : 0}%
                    </p>
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
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {PIPELINES.map(pipeline => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex h-full overflow-x-auto p-6 gap-6">
            {PIPELINE_STAGES.map(stage => (
              <OpportunityColumn
                key={stage.id}
                stage={stage}
                opportunities={getOpportunitiesByStage(stage.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <OpportunityCard
                opportunity={opportunities.find(o => o.id === activeId)!}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}