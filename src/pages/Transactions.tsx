import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download } from "lucide-react";

const Transactions = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">
                Ledger view of all payments and financial activity
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpDown className="mr-2 h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ArrowUpDown className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
                <p className="text-muted-foreground">
                  Transaction history will appear here once payments are processed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Transactions;