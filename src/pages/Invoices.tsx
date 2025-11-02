import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceStatsCards } from "@/components/invoices/InvoiceStatsCards";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { InvoiceViewDialog } from "@/components/invoices/InvoiceViewDialog";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { Invoice } from "@/utils/mockData/mockInvoices";
import { useState } from "react";
import { toast } from "sonner";

const Invoices = () => {
  const {
    invoices,
    stats,
    filters,
    setFilters,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    addInvoice(invoiceData);
    toast.success('Invoice created successfully');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(null);
    setEditingInvoice(invoice);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
      toast.success('Invoice updated successfully');
      setEditingInvoice(null);
    }
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    toast.success('Invoice deleted successfully');
  };

  const handleMarkAsPaid = (id: string) => {
    markAsPaid(id);
    toast.success('Invoice marked as paid');
  };

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Hero Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-muted/30 via-background to-muted/20 p-4 md:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Invoices</h1>
              <p className="text-lg text-muted-foreground mt-1">
                Manage patient billing and track payments
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-shrink-0 p-4 md:p-6">
          <InvoiceStatsCards stats={stats} />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-auto p-4 md:p-6 space-y-6">
          {/* Filters */}
          <InvoiceFilters filters={filters} onFilterChange={setFilters} />

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    All Invoices ({invoices.length})
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track and manage your billing
                  </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="md:hidden">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <InvoicesTable
                invoices={invoices}
                onViewInvoice={setSelectedInvoice}
                onEditInvoice={handleEditInvoice}
                onMarkAsPaid={handleMarkAsPaid}
                onDeleteInvoice={handleDeleteInvoice}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <InvoiceViewDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onMarkAsPaid={handleMarkAsPaid}
        />
        <CreateInvoiceDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setEditingInvoice(null);
          }}
          onSave={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
          invoice={editingInvoice}
        />
      </div>
    </Layout>
  );
};

export default Invoices;
