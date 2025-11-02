import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Pipeline {
  id: string;
  name: string;
  is_default?: boolean;
}

interface PipelineToolbarProps {
  pipelines: Pipeline[];
  selectedPipeline: string | null;
  onPipelineChange: (pipelineId: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function PipelineToolbar({
  pipelines,
  selectedPipeline,
  onPipelineChange,
  showFilters,
  onToggleFilters,
}: PipelineToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <Select value={selectedPipeline || undefined} onValueChange={onPipelineChange}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select pipeline" />
          </SelectTrigger>
          <SelectContent>
            {pipelines.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name} {pipeline.is_default && "(Default)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={onToggleFilters}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/pipeline-management")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Pipelines
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>
    </div>
  );
}
