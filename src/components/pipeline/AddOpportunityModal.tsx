import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useOpportunities } from '@/hooks/useOpportunities';

interface AddOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOpportunityModal({ open, onOpenChange }: AddOpportunityModalProps) {
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_phone: '',
    contact_email: '',
    case_type: '',
    estimated_value: '',
    notes: '',
  });

  const { createOpportunity } = useOpportunities();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOpportunity({
        ...formData,
        estimated_value: parseFloat(formData.estimated_value) || 0,
        pipeline_stage: 'lead', // Start in lead stage
        source: 'manual',
        created_at: new Date().toISOString(),
      });
      
      toast.success('Opportunity created successfully');
      onOpenChange(false);
      setFormData({
        patient_name: '',
        contact_phone: '',
        contact_email: '',
        case_type: '',
        estimated_value: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create opportunity');
      console.error('Error creating opportunity:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Opportunity</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_name">Patient/Contact Name</Label>
            <Input
              id="patient_name"
              value={formData.patient_name}
              onChange={(e) => handleInputChange('patient_name', e.target.value)}
              placeholder="Enter patient or contact name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="Phone number"
                type="tel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="Email address"
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case_type">Case Type</Label>
              <Select 
                value={formData.case_type} 
                onValueChange={(value) => handleInputChange('case_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIP">PIP</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Slip and Fall">Slip and Fall</SelectItem>
                  <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                  <SelectItem value="Cash Plan">Cash Plan</SelectItem>
                  <SelectItem value="Attorney Only">Attorney Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Estimated Value</Label>
              <Input
                id="estimated_value"
                value={formData.estimated_value}
                onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this opportunity"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Opportunity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}