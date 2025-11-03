import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePaymentOrders } from "@/hooks/usePaymentOrders";
import { PaymentOrderStatsCards } from "@/components/payment-orders/PaymentOrderStatsCards";
import { PaymentOrderFilters } from "@/components/payment-orders/PaymentOrderFilters";
import { PaymentOrdersTable } from "@/components/payment-orders/PaymentOrdersTable";
import { PaymentOrderViewDialog } from "@/components/payment-orders/PaymentOrderViewDialog";
import { CreatePaymentOrderDialog } from "@/components/payment-orders/CreatePaymentOrderDialog";
import { PaymentOrder } from "@/utils/mockData/mockPaymentOrders";
import { toast } from "sonner";

const PaymentOrders = () => {
  const {
    paymentOrders,
    filters,
    setFilters,
    stats,
    getPaymentProgress,
    isUpcomingThisWeek,
  } = usePaymentOrders();

  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleViewOrder = (order: PaymentOrder) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (order: PaymentOrder) => {
    toast.info("Edit functionality coming soon");
  };

  const handleProcessNow = (order: PaymentOrder) => {
    toast.success(`Processing payment for ${order.patientName}`);
  };

  const handleTogglePause = (order: PaymentOrder) => {
    const action = order.status === 'paused' ? 'resumed' : 'paused';
    toast.success(`Payment plan ${action} successfully`);
  };

  const handleCancelOrder = (order: PaymentOrder) => {
    toast.success(`Payment plan cancelled for ${order.patientName}`);
  };

  const handleCreateOrder = (data: any) => {
    console.log("Creating payment order:", data);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Payment Orders</h1>
            <p className="text-lg text-muted-foreground">
              Manage recurring payment plans and scheduled payments
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Order
          </Button>
        </div>

        {/* Stats Cards */}
        <PaymentOrderStatsCards stats={stats} />

        {/* Filters */}
        <PaymentOrderFilters filters={filters} onFilterChange={setFilters} />

        {/* Main Table */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Payment Orders ({paymentOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentOrdersTable
              orders={paymentOrders}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
              onProcessNow={handleProcessNow}
              onTogglePause={handleTogglePause}
              onCancelOrder={handleCancelOrder}
              getPaymentProgress={getPaymentProgress}
              isUpcomingThisWeek={isUpcomingThisWeek}
            />
          </CardContent>
        </Card>

        {/* View Dialog */}
        <PaymentOrderViewDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onProcessNow={handleProcessNow}
          onTogglePause={handleTogglePause}
          onCancel={handleCancelOrder}
          onEdit={handleEditOrder}
          getPaymentProgress={getPaymentProgress}
        />

        {/* Create Dialog */}
        <CreatePaymentOrderDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleCreateOrder}
        />
      </div>
    </Layout>
  );
};

export default PaymentOrders;
