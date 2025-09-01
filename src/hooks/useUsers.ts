import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    
    const uncachedIds = userIds.filter(id => !users.has(id));
    if (uncachedIds.length === 0) return;

    try {
      setLoading(true);
      // Use restricted query for non-admin users to respect security policies
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, avatar_url')
        .in('user_id', uncachedIds);

      if (error) throw error;

      const newUsers = new Map(users);
      data?.forEach(user => {
        newUsers.set(user.user_id, user);
      });
      
      setUsers(newUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUser = (userId: string) => users.get(userId);

  const getUserInitials = (userId: string) => {
    const user = getUser(userId);
    if (user?.first_name || user?.last_name) {
      return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || '?';
  };

  const getUserName = (userId: string) => {
    const user = getUser(userId);
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.email || 'Unknown User';
  };

  const getUserColor = (userId: string) => {
    // Generate consistent color based on user ID
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return {
    users,
    loading,
    fetchUsers,
    getUser,
    getUserInitials,
    getUserName,
    getUserColor,
  };
};