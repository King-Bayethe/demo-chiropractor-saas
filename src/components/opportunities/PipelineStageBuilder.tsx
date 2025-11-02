import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePipelineStages } from '@/hooks/usePipelines';
import { cn } from '@/lib/utils';

interface PipelineStageBuilderProps {
  pipelineId: string;
}

const STAGE_COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Red', value: 'bg-red-500' },
];

export function PipelineStageBuilder({ pipelineId }: PipelineStageBuilderProps) {
  const { stages, createStage, updateStage, deleteStage } = usePipelineStages(pipelineId);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('bg-blue-500');

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;

    await createStage({
      pipeline_id: pipelineId,
      name: newStageName.trim(),
      color: newStageColor,
      position: stages.length + 1,
      is_closed_won: false,
      is_closed_lost: false,
    });

    setNewStageName('');
    setNewStageColor('bg-blue-500');
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      await deleteStage(stageId);
    }
  };

  const handleUpdateStageName = async (stageId: string, name: string) => {
    await updateStage(stageId, { name });
  };

  const handleUpdateStageColor = async (stageId: string, color: string) => {
    await updateStage(stageId, { color });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Manage the stages in your pipeline. Drag to reorder.
      </div>

      {/* Existing Stages */}
      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="flex items-center gap-3 p-3 border rounded-lg bg-background"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move flex-shrink-0" />
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
              <div className="relative">
                <div className={cn("h-6 w-6 rounded-full cursor-pointer", stage.color)} />
                <select
                  value={stage.color}
                  onChange={(e) => handleUpdateStageColor(stage.id, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {STAGE_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              value={stage.name}
              onChange={(e) => handleUpdateStageName(stage.id, e.target.value)}
              className="flex-1"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteStage(stage.id)}
              className="flex-shrink-0"
              disabled={stages.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New Stage */}
      <div className="border-t pt-4">
        <Label className="text-sm font-medium mb-2 block">Add New Stage</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn("h-10 w-10 rounded-full cursor-pointer", newStageColor)} />
            <select
              value={newStageColor}
              onChange={(e) => setNewStageColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              {STAGE_COLORS.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            placeholder="Stage name..."
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            className="flex-1"
          />

          <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
