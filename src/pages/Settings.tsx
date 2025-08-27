import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { SettingsLayout } from "@/components/SettingsLayout";
import { MyProfileSection } from "@/components/MyProfileSection";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { AISettings } from "@/components/settings/AISettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { ProviderAvailabilityManager } from "@/components/calendar/ProviderAvailabilityManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        return (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Company Timezone</h3>
                <p className="text-sm text-muted-foreground">
                  This timezone will be used for all scheduling and appointment times across the system.
                </p>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Default Timezone:</label>
                  <span className="px-3 py-1 bg-medical-blue text-white rounded-md text-sm font-medium">
                    Eastern Standard Time (EST)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  All times displayed throughout the application will be shown in EST. 
                  Provider availability and appointment scheduling will use EST as the reference timezone.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case "schedule":
        return <ProviderAvailabilityManager />;
      case "notifications":
        return <NotificationSettings />;
      case "ai":
        return <AISettings />;
      case "language":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Language Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Language settings coming soon...</p>
            </CardContent>
          </Card>
        );
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
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case "users":
        return <UserManagement />;
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