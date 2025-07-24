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
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                Task Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Create and assign tasks to team members with due dates.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Tasks;