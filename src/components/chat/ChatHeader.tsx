import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Users, Trash2, Info, RefreshCw, Menu, Phone, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";

interface Participant {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: 'doctor' | 'admin' | 'nurse' | 'overlord' | 'staff';
  is_admin?: boolean;
}

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: Participant[];
  last_message_at?: string;
  created_by: string;
}

interface ChatHeaderProps {
  selectedChat: Chat | null;
  currentUserId: string | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onDeleteChat?: (chatId: string) => void;
  onRefresh?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  currentUserId,
  onToggleSidebar,
  sidebarCollapsed,
  onDeleteChat,
  onRefresh
}) => {
  const { profile } = useProfile();

  const getCurrentUserDisplayName = (): string => {
    if (!profile) return 'User';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const role = profile.role === 'admin' ? '(Admin)' : 
                 profile.role === 'doctor' ? '(Dr.)' : 
                 profile.role === 'nurse' ? '(RN)' : 
                 profile.role === 'overlord' ? '(Admin)' : '';
    
    const fullName = `${firstName} ${lastName} ${role}`.trim();
    return fullName || profile.email || 'User';
  };

  const getCurrentUserAvatar = (): string => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U';
  };

  if (!selectedChat) {
    return (
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="mr-4">
            <Menu className="w-4 h-4" />
          </Button>
          <div className="text-muted-foreground">Select a conversation</div>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className={sidebarCollapsed ? "mr-0" : "mr-2"}>
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getCurrentUserAvatar()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              {getCurrentUserDisplayName()}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground capitalize">
                  online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh chat">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        
        {selectedChat.type === 'direct' && (
          <>
            <Button variant="ghost" size="icon" title="Voice call">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Video call">
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="icon" title="Chat info">
          <Info className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Info className="w-4 h-4 mr-2" />
                Chat Info
              </DropdownMenuItem>
              {selectedChat.type === 'group' && (
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
              )}
              {onDeleteChat && (
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteChat(selectedChat.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Archive Chat
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};