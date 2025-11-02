import { useState } from 'react';
import { Check, ChevronDown, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePipelines } from '@/hooks/usePipelines';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PipelineSelectorProps {
  selectedPipelineId: string | null;
  onSelectPipeline: (pipelineId: string) => void;
}

export function PipelineSelector({ selectedPipelineId, onSelectPipeline }: PipelineSelectorProps) {
  const { pipelines, loading } = usePipelines();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId) || pipelines.find(p => p.is_default);

  if (loading) {
    return (
      <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-64 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <span className="truncate">{selectedPipeline?.name || 'Select Pipeline'}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Pipelines
        </div>
        {pipelines.map((pipeline) => (
          <DropdownMenuItem
            key={pipeline.id}
            onClick={() => {
              onSelectPipeline(pipeline.id);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  pipeline.id === selectedPipelineId ? "bg-primary" : "bg-muted"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{pipeline.name}</div>
                  {pipeline.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {pipeline.description}
                    </div>
                  )}
                </div>
              </div>
              {pipeline.id === selectedPipelineId && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            navigate('/pipeline-management');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Pipelines
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            navigate('/pipeline-management?create=true');
            setOpen(false);
          }}
          className="cursor-pointer text-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Pipeline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
