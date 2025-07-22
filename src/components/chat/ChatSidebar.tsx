import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Users, 
  MessageCircle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: any[];
  last_message_at?: string;
  created_by: string;
  unreadCount?: number;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  currentUserId: string | null;
  loading: boolean;
  collapsed: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  currentUserId,
  loading,
  collapsed
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === 'group') return chat.name || 'Medical Team Group';
    
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== currentUserId);
    
    if (otherParticipant) {
      const firstName = otherParticipant.first_name?.trim() || '';
      const lastName = otherParticipant.last_name?.trim() || '';
      const email = otherParticipant.email?.trim() || '';
      
      // Priority 1: Full Name with role
      if (firstName && lastName) {
        const role = otherParticipant.role === 'admin' ? ' (Admin)' : 
                     otherParticipant.role === 'doctor' ? ' (Dr.)' : 
                     otherParticipant.role === 'staff' ? ' (Staff)' : 
                     otherParticipant.role === 'overlord' ? ' (Admin)' : '';
        
        return `${firstName} ${lastName}${role}`;
      }
      
      // Priority 2: Individual name with role
      if (firstName || lastName) {
        const name = firstName || lastName;
        const role = otherParticipant.role === 'admin' ? ' (Admin)' : 
                     otherParticipant.role === 'doctor' ? ' (Dr.)' : 
                     otherParticipant.role === 'staff' ? ' (Staff)' : 
                     otherParticipant.role === 'overlord' ? ' (Admin)' : '';
        
        return `${name}${role}`;
      }
      
      // Priority 3: Email address as fallback
      if (email) {
        return email;
      }
    }
    
    // Better fallback - use chat name or default
    return chat.name || 'Unknown Chat';
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === 'group') {
      return 'GT';
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.user_id !== currentUserId);
    if (otherParticipant) {
      // Check if participant has a name field directly
      if (otherParticipant.name) {
        const nameParts = otherParticipant.name.trim().split(' ');
        if (nameParts.length >= 2) {
          return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return `${nameParts[0][0]}${nameParts[0][1] || ''}`.toUpperCase();
      }
      
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      const email = otherParticipant.email || '';
      
      // Try to get initials from first and last name
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      }
      
      // Try single name
      if (firstName || lastName) {
        const name = firstName || lastName;
        return `${name[0]}${name[1] || ''}`.toUpperCase();
      }
      
      // Fallback to email initials
      if (email) {
        const emailParts = email.split('@')[0];
        return `${emailParts[0]}${emailParts[1] || ''}`.toUpperCase();
      }
    }
    return 'GM';
  };

  const getLastMessageTime = (chat: Chat): string => {
    if (!chat.last_message_at) return '';
    return formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true });
  };

  const filteredChats = chats.filter(chat =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) return null;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Team Chat</h2>
          <Button
            onClick={onCreateChat}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">No conversations found</p>
            <Button
              onClick={onCreateChat}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group",
                  "hover:bg-muted/50",
                  selectedChat?.id === chat.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/30"
                )}
                onClick={() => onSelectChat(chat)}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {getChatAvatar(chat)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === 'group' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 ml-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate text-foreground">
                      {getChatDisplayName(chat)}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary text-primary-foreground text-xs h-5 px-1.5"
                        >
                          {chat.unreadCount}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Archive Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.type === 'group' 
                        ? `${chat.participants?.length || 0} members`
                        : 'Direct message'
                      }
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {getLastMessageTime(chat)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};