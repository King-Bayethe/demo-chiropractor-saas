
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'staff' | 'overlord';
  is_active: boolean;
  avatar_url?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, role, is_active, avatar_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<UserProfile, 'user_id'>) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });

      if (authError) throw authError;

      // Then create/update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          is_active: userData.is_active,
        });

      if (profileError) throw profileError;
      
      await refreshUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('user_id', userId);

      if (error) throw error;
      await refreshUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete the profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Then delete the auth user (admin function)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
      await refreshUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
};
