import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePipelines, type Pipeline } from '@/hooks/usePipelines';
import { PipelineStageBuilder } from './PipelineStageBuilder';

interface EditPipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: Pipeline;
}

export function EditPipelineModal({ open, onOpenChange, pipeline }: EditPipelineModalProps) {
  const { updatePipeline } = usePipelines();
  const [name, setName] = useState(pipeline.name);
  const [description, setDescription] = useState(pipeline.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(pipeline.name);
    setDescription(pipeline.description || '');
  }, [pipeline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await updatePipeline(pipeline.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Edit Pipeline</DialogTitle>
              <DialogDescription>
                Update pipeline details and manage stages
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Pipeline Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Pipeline name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Brief description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !name.trim()}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="stages" className="mt-4">
            <PipelineStageBuilder pipelineId={pipeline.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
