import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePipelines } from '@/hooks/usePipelines';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PipelineCard } from '@/components/opportunities/PipelineCard';
import { CreatePipelineModal } from '@/components/opportunities/CreatePipelineModal';
import { EditPipelineModal } from '@/components/opportunities/EditPipelineModal';

export default function PipelineManagement() {
  const { pipelines, loading } = usePipelines();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const editingPipeline = pipelines.find(p => p.id === editingPipelineId);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/opportunities')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pipeline Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your sales pipelines
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && pipelines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Plus className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">No Pipelines Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create your first pipeline to start organizing your opportunities
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Pipeline
          </Button>
        </div>
      )}

      {/* Pipeline Grid */}
      {!loading && pipelines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onEdit={() => setEditingPipelineId(pipeline.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePipelineModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingPipeline && (
        <EditPipelineModal
          open={!!editingPipelineId}
          onOpenChange={(open) => !open && setEditingPipelineId(null)}
          pipeline={editingPipeline}
        />
      )}
    </div>
  );
}
