import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  break_start_time?: string;
  break_end_time?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedTimeSlot {
  id: string;
  provider_id: string;
  title: string;
  start_time: string; // ISO date string
  end_time: string; // ISO date string
  reason?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  start: string;
  end: string;
  duration: number; // in minutes
  provider_id: string;
}

export const useProviderAvailability = () => {
  const [availability, setAvailability] = useState<ProviderAvailability[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProviderAvailability = async (providerId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('provider_availability')
        .select('*')
        .order('day_of_week');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setAvailability(data || []);
    } catch (err) {
      console.error('Error fetching provider availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch availability';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedSlots = async (providerId?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('blocked_time_slots')
        .select('*')
        .order('start_time');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      if (startDate) {
        query = query.gte('start_time', startDate);
      }

      if (endDate) {
        query = query.lte('end_time', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setBlockedSlots(data || []);
    } catch (err) {
      console.error('Error fetching blocked slots:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blocked slots';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAvailability = async (availabilityData: Omit<ProviderAvailability, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check permission: user can only create availability for themselves unless they're overlord
      if (userRole !== 'overlord' && availabilityData.provider_id !== user.id) {
        throw new Error('Permission denied: You can only manage your own schedule');
      }

      const { data, error } = await supabase
        .from('provider_availability')
        .insert({
          ...availabilityData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Availability created successfully',
      });

      await fetchProviderAvailability();
      return data;
    } catch (err) {
      console.error('Error creating availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create availability';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateAvailability = async (id: string, updates: Partial<ProviderAvailability>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check permission: user can only update availability for themselves unless they're overlord  
      if (userRole !== 'overlord' && updates.provider_id && updates.provider_id !== user.id) {
        throw new Error('Permission denied: You can only manage your own schedule');
      }

      const { data, error } = await supabase
        .from('provider_availability')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Availability updated successfully',
      });

      await fetchProviderAvailability();
      return data;
    } catch (err) {
      console.error('Error updating availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update availability';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const createBlockedSlot = async (blockData: Omit<BlockedTimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check permission: user can only create blocked slots for themselves unless they're overlord
      if (userRole !== 'overlord' && blockData.provider_id && blockData.provider_id !== user.id) {
        throw new Error('Permission denied: You can only manage your own schedule');
      }

      const { data, error } = await supabase
        .from('blocked_time_slots')
        .insert({
          ...blockData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Time blocked successfully',
      });

      await fetchBlockedSlots();
      return data;
    } catch (err) {
      console.error('Error creating blocked slot:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to block time';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getAvailableSlots = async (
    providerId: string,
    date: string,
    durationMinutes: number = 60,
    bufferMinutes: number = 15
  ): Promise<AvailableSlot[]> => {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      // Get provider's availability for this day
      const providerAvailability = availability.find(
        a => a.provider_id === providerId && a.day_of_week === dayOfWeek && a.is_available
      );

      if (!providerAvailability) {
        return [];
      }

      const slots: AvailableSlot[] = [];
      const startTime = new Date(`${date}T${providerAvailability.start_time}`);
      const endTime = new Date(`${date}T${providerAvailability.end_time}`);
      
      // Handle lunch break
      let breakStart: Date | null = null;
      let breakEnd: Date | null = null;
      if (providerAvailability.break_start_time && providerAvailability.break_end_time) {
        breakStart = new Date(`${date}T${providerAvailability.break_start_time}`);
        breakEnd = new Date(`${date}T${providerAvailability.break_end_time}`);
      }

      const slotDuration = durationMinutes + bufferMinutes;
      const current = new Date(startTime);

      while (current < endTime) {
        const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
        const slotEndWithBuffer = new Date(current.getTime() + slotDuration * 60000);

        if (slotEndWithBuffer > endTime) break;

        // Check if slot conflicts with break time
        if (breakStart && breakEnd) {
          if (current < breakEnd && slotEnd > breakStart) {
            current.setTime(breakEnd.getTime());
            continue;
          }
        }

        // Check for existing appointments and blocked slots using proper overlap detection
        // Two time ranges overlap if: start1 < end2 AND start2 < end1
        const slotStart = current.toISOString();
        const slotEndISO = slotEnd.toISOString();

        const { data: appointments } = await supabase
          .from('appointments')
          .select('start_time, end_time')
          .eq('provider_id', providerId)
          .neq('status', 'cancelled')
          .lt('start_time', slotEndISO)
          .gt('end_time', slotStart);

        const { data: blocked } = await supabase
          .from('blocked_time_slots')
          .select('start_time, end_time')
          .eq('provider_id', providerId)
          .lt('start_time', slotEndISO)
          .gt('end_time', slotStart);

        const hasConflict = (appointments || []).length > 0 || (blocked || []).length > 0;

        if (!hasConflict) {
          slots.push({
            start: current.toISOString(),
            end: slotEnd.toISOString(),
            duration: durationMinutes,
            provider_id: providerId
          });
        }

        current.setTime(current.getTime() + slotDuration * 60000);
      }

      return slots;
    } catch (err) {
      console.error('Error getting available slots:', err);
      return [];
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchProviderAvailability();
    fetchBlockedSlots();
  }, []);

  return {
    availability,
    blockedSlots,
    loading,
    error,
    fetchProviderAvailability,
    fetchBlockedSlots,
    createAvailability,
    updateAvailability,
    createBlockedSlot,
    getAvailableSlots,
  };
};