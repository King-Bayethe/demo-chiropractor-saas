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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import silvermancareLogo from "@/assets/silvermancare-logo.png";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Activity },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Forms", url: "/forms", icon: ClipboardList },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Emails", url: "/emails", icon: Mail },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CRMSidebar() {
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
    setCollapsed(!collapsed);
  };

  return (
    <div className={cn(
      "h-screen bg-black text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src={silvermancareLogo} 
                alt="Silvermancare Logo"
                className="h-8 w-8 object-contain"
              />
              <div className="text-xl font-bold text-white">
                Silvermancare
              </div>
            </div>
          )}
          {collapsed && (
            <img 
              src={silvermancareLogo} 
              alt="Silvermancare Logo"
              className="w-8 h-8 object-contain mx-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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