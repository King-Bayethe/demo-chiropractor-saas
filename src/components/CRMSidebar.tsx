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
  FileText,
  CreditCard,
  ArrowUpDown,
  Image,
  CheckSquare,
  LogOut,
  BarChart3,
  Phone,
  UserPlus,
  TrendingUp,
  FormInput,
  CalendarDays,
  CheckCircle,
  Receipt,
  FileSpreadsheet,
  Wallet,
  RefreshCw,
  Files,
  ImageIcon,
  Cog,
  Send,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Using direct path to uploaded logo

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
      { title: "Emails", url: "/emails", icon: Mail, collapsedIcon: Send },
    ]
  },
  {
    title: "Patient Management",
    items: [
      { title: "Contacts", url: "/contacts", icon: Users, collapsedIcon: UserPlus },
      { title: "Patients", url: "/patients", icon: Users, collapsedIcon: UserCheck },
      { title: "Opportunities", url: "/opportunities", icon: Activity, collapsedIcon: TrendingUp },
      { title: "Forms", url: "/forms", icon: ClipboardList, collapsedIcon: FormInput },
    ]
  },
  {
    title: "Scheduling & Tasks",
    items: [
      { title: "Calendar", url: "/calendar", icon: Calendar, collapsedIcon: CalendarDays },
      { title: "Tasks", url: "/tasks", icon: CheckSquare, collapsedIcon: CheckCircle },
    ]
  },
  {
    title: "Billing & Finance",
    items: [
      { title: "Invoices", url: "/invoices", icon: FileText, collapsedIcon: Receipt },
      { title: "Estimates", url: "/estimates", icon: FileText, collapsedIcon: FileSpreadsheet },
      { title: "Payment Orders", url: "/payment-orders", icon: CreditCard, collapsedIcon: Wallet },
      { title: "Transactions", url: "/transactions", icon: ArrowUpDown, collapsedIcon: RefreshCw },
    ]
  },
  {
    title: "Files & Media",
    items: [
      { title: "Documents", url: "/documents", icon: FolderOpen, collapsedIcon: Files },
      { title: "Media Library", url: "/media-library", icon: Image, collapsedIcon: ImageIcon },
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
}

export function CRMSidebar({ onCollapseChange }: CRMSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <TooltipProvider>
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