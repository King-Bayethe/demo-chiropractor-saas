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
  user_id: string;
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

  const getDisplayInfo = () => {
    // For direct messages, show the OTHER participant's info
    if (selectedChat?.type === 'direct') {
      const otherParticipant = selectedChat.participants?.find(
        (p: Participant) => p.user_id !== currentUserId
      );
      
      if (otherParticipant) {
        const firstName = otherParticipant.first_name || '';
        const lastName = otherParticipant.last_name || '';
        const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                     otherParticipant.role === 'doctor' ? '(Dr.)' : 
                     otherParticipant.role === 'nurse' ? '(RN)' : 
                     otherParticipant.role === 'overlord' ? '(Admin)' : '';
        
        const fullName = `${firstName} ${lastName} ${role}`.trim();
        const displayName = fullName || otherParticipant.email || 'Unknown User';
        
        const avatar = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 
                      otherParticipant.email?.[0]?.toUpperCase() || 'U';
        
        return { displayName, avatar };
      }
    }
    
    // For group chats or fallback, show chat name or current user
    if (selectedChat?.type === 'group') {
      return { 
        displayName: selectedChat.name || 'Medical Team Group', 
        avatar: 'GT' 
      };
    }
    
    // Fallback to current user (shouldn't happen for direct messages)
    if (!profile) return { displayName: 'User', avatar: 'U' };
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const role = profile.role === 'admin' ? '(Admin)' : 
                 profile.role === 'doctor' ? '(Dr.)' : 
                 profile.role === 'nurse' ? '(RN)' : 
                 profile.role === 'overlord' ? '(Admin)' : '';
    
    const fullName = `${firstName} ${lastName} ${role}`.trim();
    const displayName = fullName || profile.email || 'User';
    const avatar = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 
                   profile.email?.[0]?.toUpperCase() || 'U';
                   
    return { displayName, avatar };
  };

  if (!selectedChat) {
    return (
      <div className="h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 bg-card">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="mr-2 md:mr-4">
            <Menu className="w-4 h-4" />
          </Button>
          <div className="text-muted-foreground text-sm md:text-base">Select a conversation</div>
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
    <div className="h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 bg-card">
      <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className={sidebarCollapsed ? "mr-0" : "mr-1 md:mr-2"}>
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <div className="relative">
            <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs md:text-sm">
                {getDisplayInfo().avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-foreground text-sm md:text-base truncate">
              {getDisplayInfo().displayName}
            </h2>
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full" />
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
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh chat" className="h-8 w-8 md:h-10 md:w-10">
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        )}
        
        {selectedChat.type === 'direct' && (
          <>
            <Button variant="ghost" size="icon" title="Voice call" className="hidden md:flex h-8 w-8 md:h-10 md:w-10">
              <Phone className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Video call" className="hidden md:flex h-8 w-8 md:h-10 md:w-10">
              <Video className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="icon" title="Chat info" className="hidden md:flex h-8 w-8 md:h-10 md:w-10">
          <Info className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
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
              {selectedChat.type === 'direct' && (
                <>
                  <DropdownMenuItem className="md:hidden">
                    <Phone className="w-4 h-4 mr-2" />
                    Voice Call
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden">
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </DropdownMenuItem>
                </>
              )}
              {onDeleteChat && (
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteChat(selectedChat.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};