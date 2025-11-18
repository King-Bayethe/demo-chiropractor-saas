import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { PatientSelector } from "@/components/PatientSelector";
import { Patient } from "@/hooks/usePatients";
import { Loader2 } from "lucide-react";

interface RecordTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const RecordTransactionDialog = ({ isOpen, onClose, onSave }: RecordTransactionDialogProps) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [relatedInvoice, setRelatedInvoice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!selectedPatient || !amount || !paymentMethod || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      // For refunds and fees, make amount negative
      const finalAmount = (type === 'refund' || type === 'fee') ? -Math.abs(amountNum) : Math.abs(amountNum);

      const data = {
        patient_id: selectedPatient.id,
        patient_name: `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim(),
        type,
        amount: finalAmount,
        payment_method: paymentMethod,
        description,
        related_invoice_id: relatedInvoice || null,
        transaction_date: date,
        notes,
        status: 'completed',
        transaction_number: `TXN-${Date.now()}`,
      };

      await onSave(data);
      toast.success("Transaction recorded successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Selector */}
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
          />

          {/* Transaction Type */}
          <div>
            <Label>Transaction Type *</Label>
            <RadioGroup value={type} onValueChange={setType} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payment" id="payment" />
                <Label htmlFor="payment" className="font-normal">Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="refund" id="refund" />
                <Label htmlFor="refund" className="font-normal">Refund</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="adjustment" id="adjustment" />
                <Label htmlFor="adjustment" className="font-normal">Adjustment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fee" id="fee" />
                <Label htmlFor="fee" className="font-normal">Fee</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {(type === 'refund' || type === 'fee') && (
              <p className="text-xs text-muted-foreground mt-1">
                This will be recorded as a negative amount
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="ach">ACH Transfer</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the transaction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Related Invoice */}
          <div>
            <Label htmlFor="relatedInvoice">Related Invoice (Optional)</Label>
            <Input
              id="relatedInvoice"
              placeholder="Invoice number"
              value={relatedInvoice}
              onChange={(e) => setRelatedInvoice(e.target.value)}
            />
          </div>

          {/* Date & Time */}
          <div>
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
