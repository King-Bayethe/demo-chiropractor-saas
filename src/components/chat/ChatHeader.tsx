import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Menu,
  Phone,
  Video,
  Info,
  MoreVertical,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamChat } from '@/hooks/useTeamChat';
import { useAuth } from '../../contexts/AuthContext';

interface ChatHeaderProps {
  selectedChat: TeamChat | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onDeleteChat?: (chatId: string) => void;
  onRefresh?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  onToggleSidebar,
  sidebarCollapsed,
  onDeleteChat,
  onRefresh
}) => {
  const { user } = useAuth();

  const getChatDisplayName = (chat: TeamChat): string => {
    if (chat.type === 'group') return chat.name || 'Team Group';
    
    const otherParticipant = chat.participants?.find(p => p.id !== user?.id);
    return otherParticipant?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: TeamChat): string => {
    if (chat.type === 'group') return 'TG';
    
    const otherParticipant = chat.participants?.find(p => p.id !== user?.id);
    if (otherParticipant?.name) {
      const nameParts = otherParticipant.name.split(' ');
      return nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  if (!selectedChat) {
    return (
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h3 className="font-medium text-foreground">Select a conversation</h3>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {getChatAvatar(selectedChat)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium text-foreground">
            {getChatDisplayName(selectedChat)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedChat.type === 'group' 
              ? `${selectedChat.participants?.length || 0} members`
              : 'Direct conversation'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
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
        
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Info className="w-4 h-4 mr-2" />
              Chat Info
            </DropdownMenuItem>
            {selectedChat.type === 'group' && (
              <DropdownMenuItem>
                Manage Members
              </DropdownMenuItem>
            )}
            {onDeleteChat && (
              <DropdownMenuItem
                onClick={() => onDeleteChat(selectedChat.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};