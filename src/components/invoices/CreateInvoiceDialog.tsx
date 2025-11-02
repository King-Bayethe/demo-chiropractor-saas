import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Invoice } from "@/utils/mockData/mockInvoices";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  invoice?: Invoice | null;
}

export const CreateInvoiceDialog = ({ isOpen, onClose, onSave, invoice }: CreateInvoiceDialogProps) => {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('draft');

  const patients = [
    { id: 'p1', name: 'John Smith' },
    { id: 'p2', name: 'Sarah Johnson' },
    { id: 'p3', name: 'Michael Brown' },
    { id: 'p4', name: 'Emily Davis' },
  ];

  useEffect(() => {
    if (invoice) {
      setPatientId(invoice.patientId);
      setPatientName(invoice.patientName);
      setDate(new Date(invoice.dateIssued));
      setDueDate(new Date(invoice.dueDate));
      setItems(invoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })));
      setTaxRate(invoice.taxRate * 100);
      setNotes(invoice.notes || '');
      setStatus(invoice.status);
    } else {
      setPatientId('');
      setPatientName('');
      setDate(new Date());
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d);
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setTaxRate(0);
      setNotes('');
      setStatus('draft');
    }
  }, [invoice, isOpen]);

  const handlePatientChange = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      setPatientId(id);
      setPatientName(patient.name);
    }
  };

  const addLineItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = (saveStatus: Invoice['status']) => {
    if (!patientId || items.some(item => !item.description)) return;

    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();

    const invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'> = {
      patientId,
      patientName,
      patientEmail: `${patientName.toLowerCase().replace(' ', '.')}@email.com`,
      dateIssued: date.toISOString(),
      dueDate: dueDate.toISOString(),
      lineItems: items.filter(item => item.description).map((item, index) => ({
        id: `li${Date.now()}_${index}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      subtotal,
      taxRate: taxRate / 100,
      taxAmount: tax,
      total,
      status: saveStatus,
      notes: notes || undefined,
      paidDate: saveStatus === 'paid' ? new Date().toISOString() : undefined,
    };

    onSave(invoiceData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select value={patientId} onValueChange={handlePatientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invoice Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={(d) => d && setDueDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items *</Label>
              <Button type="button" onClick={addLineItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(item.quantity * item.unitPrice)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={items.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3 bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              <div className="flex justify-between items-center gap-2">
                <Label htmlFor="taxRate" className="text-sm text-muted-foreground">Tax Rate (%):</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 h-8"
                />
                <span className="font-medium text-foreground min-w-[80px] text-right">
                  {formatCurrency(calculateTax())}
                </span>
              </div>

              <Separator className="my-2" />
              
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or payment terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={!patientId || items.some(item => !item.description)}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave('sent')}
              disabled={!patientId || items.some(item => !item.description)}
            >
              {invoice ? 'Update & Send' : 'Create & Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-px bg-border", className)} />
);
