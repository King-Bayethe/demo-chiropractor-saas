import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const FormAnalytics = () => {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['form-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('submitted_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Form type distribution
  const formTypeData = submissions?.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.form_type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.form_type.toUpperCase(), value: 1 });
    }
    return acc;
  }, []) || [];

  // Submissions over time (last 30 days)
  const timeData = submissions?.reduce((acc: any[], curr) => {
    const date = new Date(curr.submitted_at).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []).slice(-30) || [];

  // Status distribution
  const statusData = submissions?.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.status);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: curr.status.toUpperCase(), value: 1 });
    }
    return acc;
  }, []) || [];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {formTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Total Forms Submitted</span>
              <span className="text-2xl font-bold text-primary">{submissions?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Pending Review</span>
              <span className="text-2xl font-bold text-yellow-600">
                {submissions?.filter(s => s.status === 'pending').length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Completed</span>
              <span className="text-2xl font-bold text-green-600">
                {submissions?.filter(s => s.status === 'completed').length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
