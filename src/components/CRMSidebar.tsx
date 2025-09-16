import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  Users,
  MessageSquare,
  ClipboardList,
  FolderOpen,
  Settings,
  Menu,
  X,
  Calendar,
  BarChart3,
  Phone,
  UserPlus,
  TrendingUp,
  FormInput,
  CalendarDays,
  Files,
  Cog,
  Stethoscope,
  FileEdit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

const navigationGroups = [
  {
    title: "Home",
    items: [
      { title: "Dashboard", url: "/", icon: Activity, collapsedIcon: BarChart3 },
    ]
  },
  {
    title: "Communication", 
    items: [
      { title: "Conversations", url: "/conversations", icon: MessageSquare, collapsedIcon: Phone },
      { title: "Team Chat", url: "/team-chat", icon: Users, collapsedIcon: Users },
    ]
  },
  {
    title: "Patient Management",
    items: [
      { title: "Patients", url: "/patients", icon: Users, collapsedIcon: UserPlus },
      { title: "SOAP Notes", url: "/soap-notes", icon: Stethoscope, collapsedIcon: FileEdit },
      { title: "Pipeline", url: "/opportunities", icon: Activity, collapsedIcon: TrendingUp },
      { title: "Forms", url: "/forms", icon: ClipboardList, collapsedIcon: FormInput },
    ]
  },
  {
    title: "Scheduling & Tasks",
    items: [
      { title: "Calendar", url: "/calendar", icon: Calendar, collapsedIcon: CalendarDays },
    ]
  },
  {
    title: "Files & Media",
    items: [
      { title: "Documents", url: "/documents", icon: FolderOpen, collapsedIcon: Files },
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "Settings", url: "/settings", icon: Settings, collapsedIcon: Cog },
    ]
  }
];

interface CRMSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

export function CRMSidebar({ onCollapseChange, onMobileClose }: CRMSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <TooltipProvider>
      <div className={cn(
        "h-full bg-black text-white transition-all duration-300 ease-in-out flex flex-col shadow-xl",
        collapsed ? "w-16" : "w-50"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 flex justify-center">
              {!collapsed && (
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-medical-blue mb-2">Healthcare</div>
                    <div className="text-lg text-medical-teal">Portfolio System</div>
                    <div className="text-xs text-muted-foreground mt-1">Demo Version</div>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="w-20 h-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-medical-blue">H</div>
                    <div className="text-sm text-medical-teal">P</div>
                  </div>
                </div>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 text-black/80 hover:text-black hover:bg-black/10 transition-colors flex-shrink-0"
                >
                  {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-6">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.url);
                    const IconComponent = collapsed ? item.collapsedIcon : item.icon;
                    const navItem = (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        onClick={() => isMobile && onMobileClose?.()}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                          active
                            ? "bg-white/15 text-white shadow-lg border-r-4 border-[#4DA8FF]"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <IconComponent className={cn(
                          "h-4 w-4 transition-colors",
                          collapsed ? "mx-auto" : "mr-3",
                          active ? "text-white" : "text-white/70 group-hover:text-white"
                        )} />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </NavLink>
                    );

                    return collapsed ? (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          {navItem}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : navItem;
                  })}
                </div>
                {/* Add separator between groups except for the last one */}
                {!collapsed && groupIndex < navigationGroups.length - 1 && (
                  <div className="border-t border-white/10 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        </nav>

      </div>
    </TooltipProvider>
  );
}