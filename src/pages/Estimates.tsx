import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { EstimateStatsCards } from "@/components/estimates/EstimateStatsCards";
import { EstimateFilters } from "@/components/estimates/EstimateFilters";
import { EstimatesTable } from "@/components/estimates/EstimatesTable";
import { EstimateViewDialog } from "@/components/estimates/EstimateViewDialog";
import { CreateEstimateDialog } from "@/components/estimates/CreateEstimateDialog";
import { Estimate } from "@/utils/mockData/mockEstimates";
import { useToast } from "@/hooks/use-toast";

const Estimates = () => {
  const {
    estimates,
    stats,
    filters,
    setFilters,
    addEstimate,
    updateEstimate,
    deleteEstimate,
  } = useEstimates();

  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveEstimate = (estimateData: Omit<Estimate, 'id' | 'estimateNumber' | 'dateCreated'>) => {
    if (editingEstimate) {
      updateEstimate(editingEstimate.id, estimateData);
      toast({
        title: "Estimate updated",
        description: "The estimate has been successfully updated.",
      });
      setEditingEstimate(null);
    } else {
      addEstimate(estimateData);
      toast({
        title: "Estimate created",
        description: "A new estimate has been created successfully.",
      });
    }
    setCreateDialogOpen(false);
  };

  const handleDeleteEstimate = (id: string) => {
    deleteEstimate(id);
    toast({
      title: "Estimate deleted",
      description: "The estimate has been removed.",
      variant: "destructive",
    });
  };

  const handleEditEstimate = (estimate: Estimate) => {
    setEditingEstimate(estimate);
    setCreateDialogOpen(true);
    setSelectedEstimate(null);
  };

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Hero Header */}
        <div className="flex-shrink-0 p-4 md:p-6 space-y-2 bg-gradient-to-br from-muted/30 via-background to-muted/20">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Treatment Estimates
          </h1>
          <p className="text-lg text-muted-foreground">
            Create and manage treatment plan estimates for patients
          </p>
        </div>

        {/* Stats Cards */}
        <EstimateStatsCards stats={stats} />

        {/* Filters */}
        <div className="flex-shrink-0 px-4 md:px-6">
          <EstimateFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    All Estimates
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {estimates.length} {estimates.length === 1 ? 'estimate' : 'estimates'} found
                  </p>
                </div>
                <Button onClick={() => {
                  setEditingEstimate(null);
                  setCreateDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Estimate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EstimatesTable
                estimates={estimates}
                onViewEstimate={setSelectedEstimate}
                onEditEstimate={handleEditEstimate}
                onDeleteEstimate={handleDeleteEstimate}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <EstimateViewDialog
        estimate={selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
        onEdit={handleEditEstimate}
        onDelete={handleDeleteEstimate}
      />

      <CreateEstimateDialog
        isOpen={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingEstimate(null);
        }}
        estimate={editingEstimate}
        onSave={handleSaveEstimate}
      />
    </Layout>
  );
};

export default Estimates;