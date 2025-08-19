import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { SettingsLayout } from "@/components/SettingsLayout";
import { MyProfileSection } from "@/components/MyProfileSection";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { AISettings } from "@/components/settings/AISettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

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
            <CardContent>
              <p className="text-muted-foreground">General settings coming soon...</p>
            </CardContent>
          </Card>
        );
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