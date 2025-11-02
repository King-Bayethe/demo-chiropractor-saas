import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Estimate } from "@/utils/mockData/mockEstimates";

interface CreateEstimateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  estimate?: Estimate | null;
  onSave: (estimate: Omit<Estimate, 'id' | 'estimateNumber' | 'dateCreated'>) => void;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  sessions: number;
  pricePerSession: number;
  total: number;
}

export function CreateEstimateDialog({ 
  isOpen, 
  onClose, 
  estimate,
  onSave 
}: CreateEstimateDialogProps) {
  const [patientName, setPatientName] = useState(estimate?.patientName || "");
  const [treatmentType, setTreatmentType] = useState(estimate?.treatmentType || "");
  const [phases, setPhases] = useState<Phase[]>(
    estimate?.phases || [{
      id: '1',
      name: '',
      description: '',
      sessions: 1,
      pricePerSession: 0,
      total: 0
    }]
  );
  const [discount, setDiscount] = useState(estimate?.discount || 0);
  const [validUntil, setValidUntil] = useState<Date>(
    estimate ? new Date(estimate.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [notes, setNotes] = useState(estimate?.notes || "");

  const updatePhase = (index: number, field: keyof Phase, value: string | number) => {
    const newPhases = [...phases];
    newPhases[index] = {
      ...newPhases[index],
      [field]: value,
    };
    
    // Recalculate total for this phase
    if (field === 'sessions' || field === 'pricePerSession') {
      newPhases[index].total = newPhases[index].sessions * newPhases[index].pricePerSession;
    }
    
    setPhases(newPhases);
  };

  const addPhase = () => {
    setPhases([...phases, {
      id: String(Date.now()),
      name: '',
      description: '',
      sessions: 1,
      pricePerSession: 0,
      total: 0
    }]);
  };

  const removePhase = (index: number) => {
    if (phases.length > 1) {
      setPhases(phases.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return phases.reduce((sum, phase) => sum + phase.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleSave = () => {
    onSave({
      patientId: 'temp',
      patientName,
      treatmentType,
      phases,
      subtotal: calculateSubtotal(),
      discount,
      total: calculateTotal(),
      validUntil: validUntil.toISOString(),
      status: 'draft',
      notes
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {estimate ? 'Edit Estimate' : 'Create New Estimate'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient Name</Label>
            <Input
              id="patient"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          {/* Treatment Type */}
          <div className="space-y-2">
            <Label htmlFor="treatmentType">Treatment Type</Label>
            <Input
              id="treatmentType"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              placeholder="e.g., Comprehensive Chiropractic Care"
            />
          </div>

          {/* Treatment Phases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Treatment Phases</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button>
            </div>

            {phases.map((phase, index) => (
              <div 
                key={phase.id}
                className="border border-border/50 rounded-lg p-4 space-y-3 bg-gradient-to-br from-background to-muted/10"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">Phase {index + 1}</h4>
                  {phases.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor={`phase-name-${index}`}>Phase Name</Label>
                    <Input
                      id={`phase-name-${index}`}
                      value={phase.name}
                      onChange={(e) => updatePhase(index, 'name', e.target.value)}
                      placeholder="e.g., Phase 1: Initial Relief"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor={`phase-desc-${index}`}>Description</Label>
                    <Textarea
                      id={`phase-desc-${index}`}
                      value={phase.description}
                      onChange={(e) => updatePhase(index, 'description', e.target.value)}
                      placeholder="Brief description of this phase"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phase-sessions-${index}`}>Sessions</Label>
                    <Input
                      id={`phase-sessions-${index}`}
                      type="number"
                      min="1"
                      value={phase.sessions}
                      onChange={(e) => updatePhase(index, 'sessions', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phase-price-${index}`}>Price per Session</Label>
                    <Input
                      id={`phase-price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={phase.pricePerSession}
                      onChange={(e) => updatePhase(index, 'pricePerSession', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Phase Total</Label>
                    <div className="text-xl font-bold text-foreground">
                      ${phase.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !validUntil && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validUntil ? format(validUntil, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date) => date && setValidUntil(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Terms & Conditions)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special terms, conditions, or notes"
              rows={3}
            />
          </div>

          {/* Cost Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${calculateSubtotal().toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>${calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {estimate ? 'Update Estimate' : 'Create Estimate'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
