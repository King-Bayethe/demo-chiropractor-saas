import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Settings,
  User,
  Bell,
  Globe,
  Puzzle,
  Shield,
  Brain,
  Calendar,
  Users,
  Clock,
  Menu,
  ChevronLeft
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
    id: "schedule",
    label: "Schedule Management",
    icon: Calendar
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell
  },
  {
    id: "ai",
    label: "AI Features",
    icon: Brain
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
  },
  {
    id: "users",
    label: "User Management",
    icon: Users
  },
  {
    id: "coming-soon",
    label: "Coming Soon",
    icon: Clock
  }
];

export const SettingsLayout = ({ children, activeSection, onSectionChange }: SettingsLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = settingsSections.find(section => section.id === activeSection);

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <h2 className="font-semibold text-lg mb-4 flex-shrink-0 px-2">Settings</h2>
      <nav className="space-y-1 flex-1 overflow-y-auto">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                activeSection === section.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleSectionChange(section.id)}
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 h-full">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate flex items-center">
                {currentSection?.icon && (
                  <currentSection.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                {currentSection?.label || "Settings"}
              </h1>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-12 gap-6 h-full min-h-0">
        {/* Desktop Sidebar */}
        <div className="col-span-3 h-full">
          <Card className="border border-border/50 shadow-sm h-full">
            <div className="p-6 h-full">
              <SidebarContent />
            </div>
          </Card>
        </div>

        {/* Desktop Main Content */}
        <div className="col-span-9 h-full min-h-0">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};