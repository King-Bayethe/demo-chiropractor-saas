import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CreatePaymentOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const CreatePaymentOrderDialog = ({ isOpen, onClose, onSave }: CreatePaymentOrderDialogProps) => {
  const [patientId, setPatientId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [customDays, setCustomDays] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endCondition, setEndCondition] = useState("ongoing");
  const [endDate, setEndDate] = useState("");
  const [numberOfPayments, setNumberOfPayments] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [autoProcess, setAutoProcess] = useState(true);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!patientId || !description || !amount || !paymentMethod) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    const data = {
      patient_id: patientId,
      description,
      amount: amountNum,
      frequency,
      custom_frequency_days: frequency === 'custom' ? parseInt(customDays) : undefined,
      start_date: startDate,
      end_date: endCondition === 'endDate' ? endDate : undefined,
      total_payments: endCondition === 'numberOfPayments' ? parseInt(numberOfPayments) : undefined,
      payment_method: paymentMethod,
      auto_process: autoProcess,
      notes,
      status: 'active',
      payments_made: 0,
    };

    onSave(data);
    toast.success("Payment order created successfully");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Payment Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Selector */}
          <div>
            <Label htmlFor="patient">Patient *</Label>
            <Input
              id="patient"
              placeholder="Enter patient ID or name"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Plan Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Monthly treatment plan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Frequency Days */}
          {frequency === 'custom' && (
            <div>
              <Label htmlFor="customDays">Days Between Payments</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                placeholder="Number of days"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
              />
            </div>
          )}

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Condition */}
          <div>
            <Label>End Condition</Label>
            <RadioGroup value={endCondition} onValueChange={setEndCondition} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ongoing" id="ongoing" />
                <Label htmlFor="ongoing" className="font-normal">Ongoing (no end date)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="endDate" id="endDate" />
                <Label htmlFor="endDate" className="font-normal">End Date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="numberOfPayments" id="numberOfPayments" />
                <Label htmlFor="numberOfPayments" className="font-normal">Number of Payments</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional End Date */}
          {endCondition === 'endDate' && (
            <div>
              <Label htmlFor="endDateValue">End Date</Label>
              <Input
                id="endDateValue"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Conditional Number of Payments */}
          {endCondition === 'numberOfPayments' && (
            <div>
              <Label htmlFor="numberOfPaymentsValue">Number of Payments</Label>
              <Input
                id="numberOfPaymentsValue"
                type="number"
                min="1"
                placeholder="Total number of payments"
                value={numberOfPayments}
                onChange={(e) => setNumberOfPayments(e.target.value)}
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card_1234">Card ending in 1234</SelectItem>
                <SelectItem value="bank_5678">Bank account ***5678</SelectItem>
                <SelectItem value="card_9012">Card ending in 9012</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-Process Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Process Payments</Label>
              <p className="text-sm text-muted-foreground">
                Automatically charge on due date
              </p>
            </div>
            <Switch checked={autoProcess} onCheckedChange={setAutoProcess} />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Payment Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
