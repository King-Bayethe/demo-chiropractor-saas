import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  Users,
  MessageSquare,
  ClipboardList,
  FolderOpen,
  Settings,
  Mail,
  Menu,
  X,
  Calendar,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
// Using direct path to uploaded logo

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Activity },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "SOAP Notes", url: "/soap-notes", icon: ClipboardList },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Forms", url: "/forms", icon: ClipboardList },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Emails", url: "/emails", icon: Mail },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface CRMSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function CRMSidebar({ onCollapseChange }: CRMSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  return (
    <div className={cn(
      "h-screen bg-black text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 flex justify-center">
            {!collapsed && (
              <img 
                src="/lovable-uploads/d20b903a-e010-419b-ae88-29c72575f3ee.png" 
                alt="Dr. Silverman Chiropractic and Rehabilitation"
                className="h-32 object-contain"
              />
            )}
            {collapsed && (
              <img 
                src="/lovable-uploads/9e0aa9c7-2269-40d3-b093-f00769ff07c2.png" 
                alt="Dr. Silverman Logo"
                className="w-20 h-20 object-contain"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-black/80 hover:text-black hover:bg-black/10 transition-colors flex-shrink-0"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const active = isActive(item.url);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-white/15 text-white shadow-lg border-r-4 border-[#4DA8FF]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  collapsed ? "mx-auto" : "mr-3",
                  active ? "text-white" : "text-white/70 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!collapsed ? (
          <div className="text-center">
            <p className="text-xs text-white/60">Dr. Silverman CRM</p>
            <p className="text-xs text-white/40">v2.0</p>
          </div>
        ) : (
          <div className="h-2"></div>
        )}
      </div>
    </div>
  );
}