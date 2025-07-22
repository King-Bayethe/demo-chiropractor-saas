import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Settings, Plus, Search, MoreHorizontal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// TypeScript Types
interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface Participant {
  id: string;
  chat_id: string;
  user_id: string;
  profiles: Profile;
}

interface TeamChat {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  participants: Participant[];
  unread_count?: number;
}

interface AppSidebarProps {
  selectedChatId?: string;
  onSelectChat?: (chat: TeamChat) => void;
  onDeleteChat?: (chatId: string) => void;
  onCreateNewChat?: () => void;
}

const mainNavItems = [
  { title: "Conversations", url: "/conversations", icon: MessageCircle },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ 
  selectedChatId, 
  onSelectChat, 
  onDeleteChat,
  onCreateNewChat 
}: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  const [chats, setChats] = useState<TeamChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper functions
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  // Fetch chats from Supabase
  const fetchChats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_chats')
        .select(`
          id,
          name,
          type,
          created_by,
          created_at,
          participants:team_chat_participants(
            id,
            chat_id,
            user_id,
            profiles(
              id,
              user_id,
              first_name,
              last_name,
              role
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter chats where current user is a participant
      const userChats = data?.filter(chat => 
        chat.participants?.some(p => p.profiles?.user_id === user.id)
      ) || [];

      setChats(userChats as TeamChat[]);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up Supabase Realtime
  useEffect(() => {
    fetchChats();

    const channel = supabase
      .channel('team-chats-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chats'
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'team_chats'
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'team_chats'
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get chat title based on type
  const getChatTitle = (chat: TeamChat): string => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat';
    }

    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants?.find(
      p => p.profiles?.user_id !== user?.id
    );

    if (otherParticipant?.profiles) {
      const firstName = otherParticipant.profiles.first_name || '';
      const lastName = otherParticipant.profiles.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Direct Chat';
    }

    return 'Direct Chat';
  };

  // Get avatar initials
  const getChatAvatar = (chat: TeamChat): string => {
    if (chat.type === 'group') {
      return chat.name?.[0]?.toUpperCase() || 'G';
    }

    const otherParticipant = chat.participants?.find(
      p => p.profiles?.user_id !== user?.id
    );

    if (otherParticipant?.profiles) {
      const firstName = otherParticipant.profiles.first_name || '';
      const lastName = otherParticipant.profiles.last_name || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      }
      if (firstName) return firstName[0].toUpperCase();
      if (lastName) return lastName[0].toUpperCase();
    }

    return 'D';
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    getChatTitle(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"}>
      {/* Fallback trigger inside the sidebar */}
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat Section - Only show on conversations page */}
        {currentPath === '/conversations' && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              {!collapsed && (
                <>
                  <span>Conversations</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCreateNewChat}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
              {collapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCreateNewChat}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </SidebarGroupLabel>

            {!collapsed && (
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            <SidebarGroupContent>
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="space-y-2 px-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        {!collapsed && (
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : filteredChats.length === 0 ? (
                  !collapsed && (
                    <div className="text-center py-4 px-3 text-muted-foreground">
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  )
                ) : (
                  <SidebarMenu>
                    {filteredChats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <div className={`
                          flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors mx-2
                          hover:bg-accent hover:text-accent-foreground
                          ${selectedChatId === chat.id ? 'bg-accent text-accent-foreground' : ''}
                        `}>
                          <div 
                            className="flex items-center space-x-2 flex-1 min-w-0"
                            onClick={() => onSelectChat?.(chat)}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getChatAvatar(chat)}
                              </AvatarFallback>
                            </Avatar>
                            
                            {!collapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium truncate text-sm">
                                    {getChatTitle(chat)}
                                  </h4>
                                  {chat.unread_count && chat.unread_count > 0 && (
                                    <Badge variant="destructive" className="ml-1 text-xs h-5">
                                      {chat.unread_count}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground truncate">
                                    {chat.type === 'direct' ? 'Direct Message' : 'Group Chat'}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {!collapsed && onDeleteChat && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onDeleteChat(chat.id)}
                                  className="text-destructive"
                                >
                                  Delete Chat
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}