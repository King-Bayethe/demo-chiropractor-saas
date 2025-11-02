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
  FileEdit,
  CheckSquare,
  Receipt,
  FileText,
  CreditCard,
  DollarSign,
  Mail,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useIsDemoUser } from "@/hooks/useDemoData";

const navigationGroups = [
  {
    title: "Home",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Activity, collapsedIcon: BarChart3 },
    ]
  },
  {
    title: "Communication", 
    items: [
      { title: "Demo Chat", url: "/demo-conversations", icon: MessageSquare, collapsedIcon: MessageSquare },
      { title: "Team Chat", url: "/team-chat", icon: Users, collapsedIcon: Users },
      { title: "Emails", url: "/emails", icon: Mail, collapsedIcon: Mail },
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
      { title: "Tasks", url: "/tasks", icon: CheckSquare, collapsedIcon: CheckSquare },
    ]
  },
  {
    title: "Financial",
    items: [
      { title: "Invoices", url: "/invoices", icon: Receipt, collapsedIcon: Receipt },
      { title: "Estimates", url: "/estimates", icon: FileText, collapsedIcon: FileText },
      { title: "Payment Orders", url: "/payment-orders", icon: CreditCard, collapsedIcon: CreditCard },
      { title: "Transactions", url: "/transactions", icon: DollarSign, collapsedIcon: DollarSign },
    ]
  },
  {
    title: "Files & Media",
    items: [
      { title: "Documents", url: "/documents", icon: FolderOpen, collapsedIcon: Files },
      { title: "Media Library", url: "/media-library", icon: Image, collapsedIcon: Image },
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
  const isDemoUser = useIsDemoUser();

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
        "h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white transition-all duration-300 ease-out flex flex-col border-r border-white/10",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Header with Logo */}
        <div className="h-20 p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-medical-blue to-medical-teal flex items-center justify-center shadow-lg animate-pulse-slow">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold text-white leading-tight">HealthFlow</div>
                <div className="text-xs text-slate-400">Portfolio CRM</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-medical-blue to-medical-teal flex items-center justify-center mx-auto shadow-lg animate-pulse-slow">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          )}
          {!collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Collapse sidebar
              </TooltipContent>
            </Tooltip>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 shadow-lg z-10"
                >
                  <Menu className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
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
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                          active
                            ? "bg-gradient-to-r from-medical-blue/20 to-medical-teal/20 text-white shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-medical-blue before:to-medical-teal before:rounded-l-lg"
                            : "text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-1 hover:scale-[1.02]"
                        )}
                      >
                        <IconComponent className={cn(
                          "h-5 w-5 transition-all duration-200",
                          collapsed ? "mx-auto" : "mr-3",
                          active 
                            ? "text-medical-blue drop-shadow-[0_0_8px_rgba(77,168,255,0.5)]" 
                            : "text-slate-400 group-hover:text-medical-teal group-hover:scale-110"
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
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : navItem;
                  })}
                </div>
                {/* Add separator between groups except for the last one */}
                {!collapsed && groupIndex < navigationGroups.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
                )}
              </div>
            ))}
          </div>
        </nav>

      </div>
    </TooltipProvider>
  );
}