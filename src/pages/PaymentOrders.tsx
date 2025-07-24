import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

const PaymentOrders = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment Orders</h1>
              <p className="text-muted-foreground">
                Track scheduled and recurring payments
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Payment Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No payment orders yet</h3>
                <p className="text-muted-foreground">
                  Set up scheduled or recurring payments for patients.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Payment Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default PaymentOrders;