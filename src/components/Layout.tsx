import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User, LogOut, Settings as SettingsIcon, UserCircle } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamChat {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  participants: any[];
  unread_count?: number;
}

interface LayoutProps {
  children: ReactNode;
  selectedChatId?: string;
  onSelectChat?: (chat: TeamChat) => void;
  onDeleteChat?: (chatId: string) => void;
  onCreateNewChat?: () => void;
}

export function Layout({ 
  children, 
  selectedChatId, 
  onSelectChat, 
  onDeleteChat, 
  onCreateNewChat 
}: LayoutProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const getDisplayName = () => {
    if (!profile) return "Loading...";
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email;
  };

  const getInitials = () => {
    if (!profile) return "U";
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile.first_name) {
      return profile.first_name[0].toUpperCase();
    }
    return profile.email[0].toUpperCase();
  };

  const getRoleDisplay = () => {
    if (!profile) return "Staff Member";
    return profile.role === 'admin' ? 'Administrator' : 
           profile.role === 'doctor' ? 'Doctor' : 
           profile.role === 'nurse' ? 'Nurse' : 
           'Staff Member';
  };

  return (
    <SidebarProvider>
      {/* Global trigger that is ALWAYS visible */}
      <header className="h-12 flex items-center border-b px-4 bg-card">
        <SidebarTrigger className="mr-4" />
        
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search patients, cases, or contacts..." 
                className="pl-10 w-80 bg-background border-border/50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-[#007BFF] text-white">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplay()}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-muted">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} alt={getDisplayName()} />
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
                    className="cursor-pointer hover:bg-muted text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <AppSidebar 
          selectedChatId={selectedChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onCreateNewChat={onCreateNewChat}
        />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}