import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CRMSidebar } from "./CRMSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Search, User, Settings as SettingsIcon, UserCircle, Menu } from "lucide-react";
import { useIsMobile, useDeviceType } from "@/hooks/use-breakpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageDropdown } from "@/components/LanguageDropdown";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock user data for portfolio demo
  const mockProfile = {
    first_name: "Portfolio",
    last_name: "Demo",
    email: "demo@healthcare-portfolio.com",
    role: "admin",
    avatar_url: null
  };

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const getDisplayName = () => {
    return "Portfolio Demo User";
  };

  const getInitials = () => {
    return "PD";
  };

  const getRoleDisplay = () => {
    return "Demo Administrator";
  };

  // Responsive layout with mobile support
  return (
    <div className="h-screen flex w-full bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed' : 'relative'} left-0 top-0 h-screen z-50 transition-transform duration-300 ${
        isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <CRMSidebar 
          onCollapseChange={setSidebarCollapsed}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
        isMobile ? 'ml-0' : ''
      }`}>
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-card px-4 sm:px-6 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search patients, cases, or contacts..." 
                className="pl-10 w-60 lg:w-80 bg-background border-border/50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Portfolio Demo
            </Badge>
            <LanguageDropdown />
            <ThemeToggle />
            <NotificationBell />
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplay()}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-muted">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={mockProfile?.avatar_url} alt={getDisplayName()} />
                      <AvatarFallback className="bg-medical-blue text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border/50 shadow-lg">
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-muted"
                    onClick={handleProfileClick}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{t('my_profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => navigate('/settings')}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}