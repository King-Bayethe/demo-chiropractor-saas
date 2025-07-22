import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GHLUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
}

export const useGHLUsers = () => {
  const [users, setUsers] = useState<GHLUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching GHL users...');
      
      const { data, error: functionError } = await supabase.functions.invoke('crud-users', {
        method: 'GET'
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to fetch users');
      }

      if (data?.error) {
        console.error('GHL API error:', data.error);
        throw new Error(data.error);
      }

      console.log('GHL users fetched successfully:', data?.users?.length || 0);
      setUsers(data?.users || []);
      
    } catch (err) {
      console.error('Error fetching GHL users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};