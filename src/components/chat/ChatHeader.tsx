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
  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === 'group') return chat.name || 'Medical Team Group';
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                   otherParticipant.role === 'doctor' ? '(Dr.)' : 
                   otherParticipant.role === 'nurse' ? '(RN)' : 
                   otherParticipant.role === 'overlord' ? '(Admin)' : '';
      
      const fullName = `${firstName} ${lastName} ${role}`.trim();
      return fullName || otherParticipant.email || 'Team Member';
    }
    return 'Team Member';
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name?.substring(0, 2).toUpperCase() || 'GT';
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'TM';
    }
    return 'TM';
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
                {getChatAvatar(selectedChat)}
              </AvatarFallback>
            </Avatar>
            {selectedChat.type === 'direct' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              {getChatDisplayName(selectedChat)}
            </h2>
            <div className="flex items-center space-x-2">
              {selectedChat.type === 'group' ? (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {selectedChat.participants?.length || 0} members
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground capitalize">
                    online
                  </span>
                </div>
              )}
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