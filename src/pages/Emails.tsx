import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

const Emails = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
              <p className="text-muted-foreground">
                Manage patient communications and email campaigns
              </p>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-16">
                <Mail className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Email management and communication features are currently in development. 
                  Check back soon for updates.
                </p>
                <div className="mt-8 text-sm text-muted-foreground">
                  <p>Planned features include:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Patient email campaigns</li>
                    <li>• Automated appointment reminders</li>
                    <li>• Template management</li>
                    <li>• Email analytics and tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Emails;