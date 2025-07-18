import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  Users,
  MessageSquare,
  ClipboardList,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope
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
  { title: "Dashboard", url: "/", icon: Activity },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Forms", url: "/forms", icon: ClipboardList },
  { title: "Documents", url: "/documents", icon: FolderOpen },
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
        : "text-white/90 hover:text-white"
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
      <SidebarHeader className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
            {!collapsed ? (
              <div className="flex flex-col items-center space-y-3 w-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-8 h-8 text-medical-blue" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white tracking-wide">SILVERMAN</h2>
                  <p className="text-xs text-white/80 leading-tight">
                    Chiropractic & Rehabilitation Center
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Stethoscope className="w-5 h-5 text-medical-blue" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 absolute top-4 right-4"
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