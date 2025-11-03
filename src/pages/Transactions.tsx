import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionStatsCards } from "@/components/transactions/TransactionStatsCards";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionViewDialog } from "@/components/transactions/TransactionViewDialog";
import { TransactionAnalytics } from "@/components/transactions/TransactionAnalytics";
import { RecordTransactionDialog } from "@/components/transactions/RecordTransactionDialog";
import { Transaction } from "@/utils/mockData/mockTransactions";
import { toast } from "sonner";

const Transactions = () => {
  const {
    transactions,
    filters,
    setFilters,
    stats,
    filterByDatePreset,
  } = useTransactions();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    toast.success("Receipt downloaded");
  };

  const handleEmailReceipt = (transaction: Transaction) => {
    toast.success("Receipt sent via email");
  };

  const handleVoidTransaction = (transaction: Transaction) => {
    toast.success("Transaction voided successfully");
  };

  const handleExport = () => {
    toast.success("Exporting transactions to CSV");
  };

  const handleRecordTransaction = (data: any) => {
    console.log("Recording transaction:", data);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Transactions</h1>
            <p className="text-lg text-muted-foreground">
              Financial ledger of all payment activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => setIsRecordDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Transaction
            </Button>
          </div>
        </div>

        <TransactionStatsCards stats={stats} />

        <TransactionFilters
          filters={filters}
          onFilterChange={setFilters}
          onDatePreset={filterByDatePreset}
          onExport={handleExport}
        />

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Transaction History ({transactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionsTable
                  transactions={transactions}
                  onViewTransaction={handleViewTransaction}
                  onDownloadReceipt={handleDownloadReceipt}
                  onVoidTransaction={handleVoidTransaction}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <TransactionAnalytics />
          </TabsContent>
        </Tabs>

        <TransactionViewDialog
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onDownloadReceipt={handleDownloadReceipt}
          onEmailReceipt={handleEmailReceipt}
          onVoid={handleVoidTransaction}
        />

        <RecordTransactionDialog
          isOpen={isRecordDialogOpen}
          onClose={() => setIsRecordDialogOpen(false)}
          onSave={handleRecordTransaction}
        />
      </div>
    </Layout>
  );
};

export default Transactions;