import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Stage {
  id: string;
  name: string;
}

interface AddOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  stages: Stage[];
  onSuccess?: () => void;
}

export function AddOpportunityDialog({
  open,
  onOpenChange,
  pipelineId,
  stages,
  onSuccess,
}: AddOpportunityDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    estimated_value: "",
    priority: "medium",
    pipeline_stage_id: stages[0]?.id || "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("opportunities").insert({
        pipeline_id: pipelineId,
        pipeline_stage_id: formData.pipeline_stage_id,
        pipeline_stage: stages.find(s => s.id === formData.pipeline_stage_id)?.name || "Unknown",
        name: formData.patient_name, // name is required
        patient_name: formData.patient_name,
        patient_email: formData.patient_email || null,
        patient_phone: formData.patient_phone || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        priority: formData.priority,
        notes: formData.notes || null,
        created_by: user.id,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });

      // Reset form
      setFormData({
        patient_name: "",
        patient_email: "",
        patient_phone: "",
        estimated_value: "",
        priority: "medium",
        pipeline_stage_id: stages[0]?.id || "",
        notes: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to create opportunity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Opportunity</DialogTitle>
            <DialogDescription>
              Add a new opportunity to your pipeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">Contact Name *</Label>
              <Input
                id="patient_name"
                value={formData.patient_name}
                onChange={(e) =>
                  setFormData({ ...formData, patient_name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_email">Email</Label>
              <Input
                id="patient_email"
                type="email"
                value={formData.patient_email}
                onChange={(e) =>
                  setFormData({ ...formData, patient_email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_phone">Phone</Label>
              <Input
                id="patient_phone"
                type="tel"
                value={formData.patient_phone}
                onChange={(e) =>
                  setFormData({ ...formData, patient_phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Estimated Value</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  step="0.01"
                  value={formData.estimated_value}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_value: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipeline_stage_id">Initial Stage</Label>
              <Select
                value={formData.pipeline_stage_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, pipeline_stage_id: value })
                }
              >
                <SelectTrigger id="pipeline_stage_id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Opportunity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
