import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGHLApi } from "@/hooks/useGHLApi";
import { 
  Search, 
  Filter, 
  Plus, 
  DollarSign, 
  Download,
  FileText,
  MoreHorizontal,
  Calendar,
  X
} from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [formData, setFormData] = useState({
    contactId: "",
    amount: "",
    description: "",
    dueDate: "",
    status: "pending"
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load contacts for dropdown
      const contactsData = await ghlApi.contacts.getAll();
      setContacts(contactsData.contacts || []);
      
      // For now, create mock invoices since GHL doesn't have direct invoice API
      // In production, you'd either store invoices in Supabase or use a different API
      const mockInvoices = [
        {
          id: "INV-001",
          contactId: contactsData.contacts?.[0]?.id,
          contactName: `${contactsData.contacts?.[0]?.firstNameLowerCase || ''} ${contactsData.contacts?.[0]?.lastNameLowerCase || ''}`,
          amount: 150.00,
          description: "Chiropractic Treatment Session",
          dateIssued: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "paid"
        },
        {
          id: "INV-002", 
          contactId: contactsData.contacts?.[1]?.id,
          contactName: `${contactsData.contacts?.[1]?.firstNameLowerCase || ''} ${contactsData.contacts?.[1]?.lastNameLowerCase || ''}`,
          amount: 250.00,
          description: "Rehabilitation Package",
          dateIssued: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending"
        }
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedContact = contacts.find((c: any) => c.id === formData.contactId);
      const newInvoice = {
        id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        contactId: formData.contactId,
        contactName: selectedContact ? `${selectedContact.firstNameLowerCase || ''} ${selectedContact.lastNameLowerCase || ''}` : '',
        amount: parseFloat(formData.amount),
        description: formData.description,
        dateIssued: new Date().toISOString(),
        dueDate: formData.dueDate,
        status: formData.status
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setIsCreateInvoiceOpen(false);
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${newInvoice.id} has been created successfully.`,
      });
      
      setFormData({
        contactId: "",
        amount: "",
        description: "",
        dueDate: "",
        status: "pending"
      });
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success";
      case "pending": return "bg-yellow-500/10 text-yellow-700";
      case "overdue": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
                <p className="text-muted-foreground">Manage patient invoices and billing</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setIsCreateInvoiceOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search invoices by ID, patient name..." 
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Total: {invoices.length}</Badge>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      Paid: {invoices.filter((inv: any) => inv.status === 'paid').length}
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                      Pending: {invoices.filter((inv: any) => inv.status === 'pending').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
              
              {/* Invoices Table */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Invoice ID</th>
                          <th className="text-left p-4 font-medium text-sm">Patient Name</th>
                          <th className="text-left p-4 font-medium text-sm">Date Issued</th>
                          <th className="text-left p-4 font-medium text-sm">Amount</th>
                          <th className="text-left p-4 font-medium text-sm">Due Date</th>
                          <th className="text-left p-4 font-medium text-sm">Status</th>
                          <th className="text-left p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              Loading invoices...
                            </td>
                          </tr>
                        ) : invoices.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              No invoices found
                            </td>
                          </tr>
                        ) : (
                          invoices.map((invoice: any) => (
                            <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-medical-blue" />
                                  <span className="font-medium text-sm">{invoice.id}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-sm">{invoice.contactName || 'Unknown Patient'}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(invoice.dateIssued).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-success" />
                                  <span className="font-medium text-sm">
                                    {formatCurrency(invoice.amount)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-sm">
                                  {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Invoice Modal */}
          <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Create New Invoice
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreateInvoiceOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contactId">Patient *</Label>
                  <Select 
                    value={formData.contactId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contactId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact: any) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {`${contact.firstNameLowerCase || ''} ${contact.lastNameLowerCase || ''}`.trim() || contact.name || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Treatment description"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Invoice</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}