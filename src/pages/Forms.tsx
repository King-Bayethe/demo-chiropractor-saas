import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { FormStatsCards } from "@/components/forms/FormStatsCards";
import { FormFilters } from "@/components/forms/FormFilters";
import { FormSubmissionsTable } from "@/components/forms/FormSubmissionsTable";
import { FormTypeCard } from "@/components/forms/FormTypeCard";
import { FormAnalytics } from "@/components/forms/FormAnalytics";
import { useFormSubmissions, FormFilters as FormFiltersType } from "@/hooks/useFormSubmissions";
import { ClipboardList, Shield, FileText, Users, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Forms = () => {
  const [activeTab, setActiveTab] = useState("submissions");
  const [filters, setFilters] = useState<FormFiltersType>({});
  const { data: submissions, isLoading } = useFormSubmissions(filters);

  return (
    <Layout>
      <div className="container mx-auto p-3 md:p-6 space-y-6 max-w-full overflow-hidden">
        {/* Hero Header */}
        <div className="relative rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 border border-border/50">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Form Management Center
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  Track, review, and manage patient form submissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <FormStatsCards />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="public-forms">Public Forms</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <FormFilters filters={filters} onFiltersChange={setFilters} />
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <FormSubmissionsTable submissions={submissions || []} />
            )}
          </TabsContent>

          {/* Public Forms Tab */}
          <TabsContent value="public-forms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormTypeCard
                title="PIP Form"
                description="Insurance details and coverage verification"
                url="/public/pip-form"
                icon={Shield}
                color="text-blue-700"
                borderColor="border-blue-500/20"
              />
              <FormTypeCard
                title="LOP Form"
                description="Payment plans and financial arrangements"
                url="/public/lop-form"
                icon={FileText}
                color="text-green-700"
                borderColor="border-green-500/20"
              />
              <FormTypeCard
                title="Cash Form"
                description="Cash pay patient registration form"
                url="/public/cash-form"
                icon={Users}
                color="text-purple-700"
                borderColor="border-purple-500/20"
              />
              <FormTypeCard
                title="New Patient"
                description="Comprehensive new patient registration"
                url="/public/new-form"
                icon={Target}
                color="text-orange-700"
                borderColor="border-orange-500/20"
              />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <FormAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Forms;
