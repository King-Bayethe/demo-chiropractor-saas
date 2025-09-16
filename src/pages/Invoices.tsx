import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";

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
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Manage patient billing and payment tracking
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="text-center py-16">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Invoice management and billing features are currently in development. 
                Check back soon for updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}