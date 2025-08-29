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