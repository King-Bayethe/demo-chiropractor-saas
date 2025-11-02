import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { usePipelines } from '@/hooks/usePipelines';

interface CreatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PIPELINE_TEMPLATES = [
  {
    id: 'medical',
    name: 'Medical Care',
    description: 'Patient journey from lead to treatment',
    stages: [
      { name: 'Lead', color: 'bg-blue-500', position: 1 },
      { name: 'Consultation Scheduled', color: 'bg-cyan-500', position: 2 },
      { name: 'Consultation Completed', color: 'bg-purple-500', position: 3 },
      { name: 'Treatment Plan Proposed', color: 'bg-indigo-500', position: 4 },
      { name: 'Treatment Approved', color: 'bg-green-500', position: 5 },
      { name: 'In Treatment', color: 'bg-emerald-500', position: 6 },
      { name: 'Discharged', color: 'bg-teal-500', position: 7, is_closed_won: true },
    ],
  },
  {
    id: 'sales',
    name: 'Sales Pipeline',
    description: 'Standard B2B sales process',
    stages: [
      { name: 'Lead', color: 'bg-blue-500', position: 1 },
      { name: 'Qualified', color: 'bg-cyan-500', position: 2 },
      { name: 'Proposal Sent', color: 'bg-purple-500', position: 3 },
      { name: 'Negotiation', color: 'bg-orange-500', position: 4 },
      { name: 'Closed Won', color: 'bg-green-500', position: 5, is_closed_won: true },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Pipeline',
    description: 'Start from scratch',
    stages: [
      { name: 'New', color: 'bg-blue-500', position: 1 },
      { name: 'In Progress', color: 'bg-purple-500', position: 2 },
      { name: 'Completed', color: 'bg-green-500', position: 3, is_closed_won: true },
    ],
  },
];

export function CreatePipelineModal({ open, onOpenChange }: CreatePipelineModalProps) {
  const { createPipeline } = usePipelines();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('medical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const pipeline = await createPipeline({
        name: name.trim(),
        description: description.trim() || undefined,
        is_default: false,
        is_active: true,
      });

      // Create stages from template
      if (pipeline) {
        const template = PIPELINE_TEMPLATES.find(t => t.id === selectedTemplate);
        if (template) {
          const { supabase } = await import('@/integrations/supabase/client');
          const stages = template.stages.map(stage => ({
            pipeline_id: pipeline.id,
            name: stage.name,
            color: stage.color,
            position: stage.position,
            is_closed_won: stage.is_closed_won || false,
            is_closed_lost: false,
          }));

          await supabase.from('pipeline_stages').insert(stages);
        }
      }

      setName('');
      setDescription('');
      setSelectedTemplate('medical');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Create New Pipeline</DialogTitle>
                <DialogDescription>
                  Set up a new pipeline to organize your opportunities
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pipeline Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Pipeline, Patient Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this pipeline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-1 gap-2">
                {PIPELINE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {template.stages.slice(0, 4).map((stage, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${stage.color}`}
                        />
                      ))}
                      {template.stages.length > 4 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{template.stages.length - 4}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
