import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";

const Tasks = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">
                Assignable tasks with due dates and statuses
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>

          <Card>
            <CardContent>
              <div className="text-center py-16">
                <CheckSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Task management and assignment features are currently in development. 
                  Check back soon for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Tasks;