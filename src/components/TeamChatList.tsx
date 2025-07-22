import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

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
  role: string;
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

interface TeamChatListProps {
  setSelectedChat: (chat: TeamChat) => void;
  selectedChatId?: string;
}

export const TeamChatList: React.FC<TeamChatListProps> = ({ 
  setSelectedChat, 
  selectedChatId 
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<TeamChat[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Get chat subtitle
  const getChatSubtitle = (chat: TeamChat): string => {
    return chat.type === 'direct' ? 'Direct Message' : 'Group Chat';
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

  // Format creation time
  const getCreationTime = (createdAt: string): string => {
    return `Created ${formatDistanceToNow(new Date(createdAt), { addSuffix: true })}`;
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No chats yet</p>
            <p className="text-sm">Start a conversation to get started</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`
                flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                hover:bg-accent hover:text-accent-foreground
                ${selectedChatId === chat.id ? 'bg-accent text-accent-foreground' : ''}
              `}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getChatAvatar(chat)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {getChatTitle(chat)}
                  </h4>
                  {chat.unread_count && chat.unread_count > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {chat.unread_count}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {getChatSubtitle(chat)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {getCreationTime(chat.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};