import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  Users,
  Phone,
  Video,
  MoreVertical,
  Info
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: any[];
  last_message_at?: string;
  created_by: string;
}

interface ChatHeaderProps {
  selectedChat: Chat | null;
  currentUserId: string | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  currentUserId,
  onToggleSidebar,
  sidebarCollapsed
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
      return 'GT';
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'TM';
    }
    return 'TM';
  };

  const getOnlineStatus = (): string => {
    // This would integrate with real presence detection
    return 'online'; // mock for now
  };

  if (!selectedChat) {
    return (
      <div className="h-16 border-b border-border flex items-center px-6 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="mr-4"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div className="text-muted-foreground">Select a conversation to start messaging</div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className={sidebarCollapsed ? "mr-0" : "mr-2"}
        >
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
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
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
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-xs text-muted-foreground">
                    {getOnlineStatus()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {selectedChat.type === 'direct' && (
          <>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="sm">
          <Info className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Info className="w-4 h-4 mr-2" />
              Chat Info
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              Manage Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};