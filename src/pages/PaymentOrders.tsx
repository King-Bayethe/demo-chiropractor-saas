import { Layout } from "@/components/Layout";
// AuthGuard removed for public portfolio
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

const PaymentOrders = () => {
  return (
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
            <CardContent>
              <div className="text-center py-16">
                <CreditCard className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Payment order and recurring payment features are currently in development. 
                  Check back soon for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
};

export default PaymentOrders;