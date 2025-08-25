import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Calendar {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  settings?: any;
}

export interface AvailableSlot {
  date: string;
  slots: Array<{
    start: string;
    end: string;
    isAvailable: boolean;
  }>;
}

export const useCalendars = () => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCalendars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching calendars...');
      const response = await supabase.functions.invoke('ghl-calendars', {
        body: { action: 'getAll' },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Calendars fetched successfully:', response.data);
      setCalendars(response.data.calendars || []);
    } catch (err) {
      console.error('Error fetching calendars:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendars';
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

  const getCalendarById = async (calendarId: string) => {
    setLoading(true);
    try {
      console.log('Fetching calendar by ID:', calendarId);
      const response = await supabase.functions.invoke('ghl-calendars', {
        body: { action: 'getById', calendarId },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Calendar fetched successfully:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching calendar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = async (calendarId: string, startDate: string, endDate: string) => {
    setLoading(true);
    try {
      console.log('Fetching available slots:', calendarId, startDate, endDate);
      const response = await supabase.functions.invoke('ghl-calendars', {
        body: { 
          action: 'getAvailableSlots', 
          calendarId, 
          startDate, 
          endDate 
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Available slots fetched successfully:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching available slots:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available slots';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  return {
    calendars,
    loading,
    error,
    fetchCalendars,
    getCalendarById,
    getAvailableSlots,
  };
};