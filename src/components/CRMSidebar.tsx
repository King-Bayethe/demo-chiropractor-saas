import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Target,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import drSilvermanLogo from "@/assets/dr-silverman-logo.png";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pipelines", url: "/pipelines", icon: Target },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Forms", url: "/forms", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CRMSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return cn(
      "transition-all duration-200 hover:bg-white/10",
      isActive(path) 
        ? "bg-white/15 text-white border-r-2 border-medical-teal" 
        : "text-sidebar-text/80 hover:text-white"
    );
  };

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 border-r border-border/20",
        collapsed ? "w-16" : "w-64"
      )}
      style={{ 
        backgroundColor: "hsl(var(--sidebar-bg))",
        color: "hsl(var(--sidebar-text))"
      }}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
            <img 
              src={drSilvermanLogo} 
              alt="Dr. Silverman Logo" 
              className={cn(
                "transition-all duration-300",
                collapsed ? "w-8 h-8" : "w-12 h-12"
              )}
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm leading-tight">
                  Dr. Silverman
                </span>
                <span className="text-white/70 text-xs">
                  Chiropractic & Rehab
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-white/60 text-xs uppercase tracking-wider mb-2",
            collapsed && "sr-only"
          )}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className={cn(
                        "transition-all duration-200",
                        collapsed ? "h-5 w-5 mx-auto" : "h-5 w-5 mr-3"
                      )} />
                      {!collapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}