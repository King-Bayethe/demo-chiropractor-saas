import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CRMSidebar } from "./CRMSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Bell, Search, User, Settings as SettingsIcon, UserCircle, Menu, LogOut } from "lucide-react";
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
import { useIsDemoUser } from "@/hooks/useDemoData";
import { useAuth } from "@/contexts/AuthContext";

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
  const isDemoUser = useIsDemoUser();
  const { signOut } = useAuth();

  // Mock user data for portfolio demo
  const mockProfile = {
    first_name: "Dr. Sarah",
    last_name: "Martinez",
    email: "demo@testing.com",
    role: "demo",
    avatar_url: "/lovable-uploads/d20b903a-e010-419b-ae88-29c72575f3ee.png"
  };

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const getDisplayName = () => {
    return isDemoUser ? "Dr. Sarah Martinez" : "Portfolio Demo User";
  };

  const getInitials = () => {
    return isDemoUser ? "SM" : "PD";
  };

  const getRoleDisplay = () => {
    return isDemoUser ? "Healthcare Professional" : "Demo Administrator";
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
        <header className="h-18 border-b border-border/50 bg-card/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden hover:bg-muted/80"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search patients, appointments, notes..." 
                className="pl-10 pr-16 h-10 w-64 lg:w-96 rounded-lg bg-muted/50 border-muted-foreground/20 
                           focus:bg-background focus:border-medical-blue transition-all duration-200"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 
                            px-2 py-1 text-xs bg-background/80 rounded border border-border text-muted-foreground
                            hidden lg:inline-block">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {isDemoUser && (
              <Badge variant="secondary" className="text-xs font-medium bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                DEMO MODE
              </Badge>
            )}
            <div className="h-6 w-px bg-border hidden sm:block"></div>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-muted text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-visible">
          {children}
        </main>
      </div>
    </div>
  );
}