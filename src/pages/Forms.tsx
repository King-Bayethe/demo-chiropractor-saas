import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { FormSubmissionDetails } from "@/components/forms/FormSubmissionDetails";
import { MockFormTestPanel } from "@/components/forms/MockFormTestPanel";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, ExternalLink, FileText, Users, Activity, Target } from "lucide-react";

const Forms = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submissions");

  return (
    <Layout>
      <div className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-foreground break-words">Form Submissions</h1>
            <p className="text-sm md:text-base text-muted-foreground">View and manage patient form submissions</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="public-forms">Public Forms</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="testing" className="bg-yellow-500/10 text-yellow-700">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4">
            <FormSubmissionDetails />
          </TabsContent>

          <TabsContent value="public-forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Public Patient Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-medical-blue/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-medical-blue">PIP Patient Intake</h3>
                          <p className="text-sm text-muted-foreground">Personal Injury Protection form</p>
                        </div>
                        <Activity className="h-8 w-8 text-medical-blue" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open('/public/pip-form', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-medical-teal/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-medical-teal">LOP Form</h3>
                          <p className="text-sm text-muted-foreground">Letter of Protection</p>
                        </div>
                        <FileText className="h-8 w-8 text-medical-teal" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open('/public/lop-form', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-700">Cash Patient Form</h3>
                          <p className="text-sm text-muted-foreground">Self-pay patient intake</p>
                        </div>
                        <Users className="h-8 w-8 text-green-700" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open('/public/cash-form', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-purple-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-purple-700">New Patient Form</h3>
                          <p className="text-sm text-muted-foreground">General new patient intake</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-700" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open('/public/new-form', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardContent>
                <div className="text-center py-16">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Form Templates</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Custom form templates and builder coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <MockFormTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Forms;