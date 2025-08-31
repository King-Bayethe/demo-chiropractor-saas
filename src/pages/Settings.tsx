import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { SettingsLayout } from "@/components/SettingsLayout";
import { MyProfileSection } from "@/components/MyProfileSection";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { AISettings } from "@/components/settings/AISettings";
import { UserManagement } from "@/components/settings/UserManagement";

import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, FileText, CreditCard, ArrowUpDown, Image } from "lucide-react";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <MyProfileSection />;
      case "general":
        return <GeneralSettings />;
      case "schedule":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Schedule management has been simplified. Use the calendar to manage your appointments directly.</p>
            </CardContent>
          </Card>
        );
      case "notifications":
        return <NotificationSettings />;
      case "ai":
        return <AISettings />;
      case "language":
        return <LanguageSettings />;
      case "integrations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integration settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case "security":
        return <SecuritySettings />;
      case "users":
        return <UserManagement />;
      case "coming-soon":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  The following features are currently in development and will be available soon:
                </p>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Task Management</h4>
                      <p className="text-sm text-muted-foreground">Assignable tasks with due dates and statuses</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Invoices</h4>
                      <p className="text-sm text-muted-foreground">Patient billing and invoice management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Treatment Estimates</h4>
                      <p className="text-sm text-muted-foreground">Estimate creation and pricing for patient cases</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Payment Orders</h4>
                      <p className="text-sm text-muted-foreground">Scheduled and recurring payment management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Transaction History</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive financial reporting and ledger view</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Image className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Media Library</h4>
                      <p className="text-sm text-muted-foreground">Centralized file and media asset management</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <MyProfileSection />;
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full overflow-hidden">
          <div className="h-full p-6">
            <SettingsLayout 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
            >
              {renderContent()}
            </SettingsLayout>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}