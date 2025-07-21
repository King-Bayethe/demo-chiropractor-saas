import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Settings,
  User,
  Bell,
  Globe,
  Puzzle,
  Shield
} from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const settingsSections = [
  {
    id: "general",
    label: "General Settings",
    icon: Settings
  },
  {
    id: "profile",
    label: "My Profile",
    icon: User
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell
  },
  {
    id: "language",
    label: "Language Preferences",
    icon: Globe
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Puzzle
  },
  {
    id: "security",
    label: "Security",
    icon: Shield
  }
];

export const SettingsLayout = ({ children, activeSection, onSectionChange }: SettingsLayoutProps) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="col-span-3">
        <Card className="border border-border/50 shadow-sm">
          <div className="p-6">
            <h2 className="font-semibold text-lg mb-4">Settings</h2>
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      activeSection === section.id && "bg-medical-blue text-white"
                    )}
                    onClick={() => onSectionChange(section.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="col-span-9">
        {children}
      </div>
    </div>
  );
};