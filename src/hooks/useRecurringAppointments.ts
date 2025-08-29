import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateAppointmentData } from './useAppointments';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  days_of_week?: number[]; // for weekly: [1,3,5] for Mon,Wed,Fri
  day_of_month?: number; // for monthly: specific day
  end_date?: string;
  max_occurrences?: number;
}

export interface RecurringAppointmentSeries {
  id: string;
  pattern: RecurrencePattern;
  base_appointment: CreateAppointmentData;
  created_instances: number;
  last_generated: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface AppointmentException {
  id: string;
  series_id: string;
  original_date: string;
  exception_type: 'cancelled' | 'rescheduled' | 'modified';
  new_start_time?: string;
  new_end_time?: string;
  reason?: string;
  created_at: string;
}

export const useRecurringAppointments = () => {
  const [series, setSeries] = useState<RecurringAppointmentSeries[]>([]);
  const [exceptions, setExceptions] = useState<AppointmentException[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecurringSeries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('is_recurring', true)
        .not('recurring_appointment_id', 'is', null);

      if (fetchError) throw new Error(fetchError.message);

      // Group by recurring_appointment_id to get series
      const seriesMap = new Map();
      (data || []).forEach(apt => {
        if (!seriesMap.has(apt.recurring_appointment_id)) {
          seriesMap.set(apt.recurring_appointment_id, {
            id: apt.recurring_appointment_id,
            pattern: JSON.parse(apt.recurrence_pattern || '{}'),
            base_appointment: {
              title: apt.title,
              contact_id: apt.patient_id,
              start_time: apt.start_time,
              end_time: apt.end_time,
              status: apt.status,
              type: apt.appointment_type,
              notes: apt.notes,
              location: apt.location,
            },
            created_instances: 0,
            last_generated: apt.created_at,
            is_active: true,
            created_at: apt.created_at,
            created_by: user.id
          });
        }
        seriesMap.get(apt.recurring_appointment_id).created_instances++;
      });

      setSeries(Array.from(seriesMap.values()));
    } catch (err) {
      console.error('Error fetching recurring series:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recurring appointments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRecurringSeries = async (
    baseAppointment: CreateAppointmentData,
    pattern: RecurrencePattern,
    generateCount: number = 10
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const seriesId = crypto.randomUUID();
      const appointments = generateAppointmentInstances(baseAppointment, pattern, generateCount);

      // Create all appointment instances
      const appointmentPromises = appointments.map(apt => 
        supabase
          .from('appointments')
          .insert({
            title: apt.title,
            patient_id: apt.contact_id,
            start_time: apt.start_time,
            end_time: apt.end_time,
            status: apt.status || 'scheduled',
            appointment_type: apt.type || 'consultation',
            notes: apt.notes,
            location: apt.location,
            
            provider_name: 'Provider', // Will be updated by trigger
            is_recurring: true,
            recurring_appointment_id: seriesId,
            recurrence_pattern: JSON.stringify(pattern)
          })
      );

      await Promise.all(appointmentPromises);

      toast({
        title: 'Success',
        description: `Created recurring appointment series with ${appointments.length} instances`,
      });

      await fetchRecurringSeries();
      return seriesId;
    } catch (err) {
      console.error('Error creating recurring series:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recurring appointments';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const generateAppointmentInstances = (
    baseAppointment: CreateAppointmentData,
    pattern: RecurrencePattern,
    count: number
  ): CreateAppointmentData[] => {
    const instances: CreateAppointmentData[] = [];
    let currentDate = new Date(baseAppointment.start_time);
    const duration = new Date(baseAppointment.end_time).getTime() - new Date(baseAppointment.start_time).getTime();

    for (let i = 0; i < count; i++) {
      const startTime = new Date(currentDate);
      const endTime = new Date(startTime.getTime() + duration);

      // Check if we've exceeded the end date
      if (pattern.end_date && startTime > new Date(pattern.end_date)) {
        break;
      }

      instances.push({
        ...baseAppointment,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      });

      // Calculate next occurrence
      currentDate = getNextOccurrence(currentDate, pattern);
    }

    return instances;
  };

  const getNextOccurrence = (currentDate: Date, pattern: RecurrencePattern): Date => {
    const nextDate = new Date(currentDate);

    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
      
      case 'weekly':
        if (pattern.days_of_week && pattern.days_of_week.length > 0) {
          // Find next day of week in the pattern
          const currentDay = nextDate.getDay();
          const sortedDays = [...pattern.days_of_week].sort((a, b) => a - b);
          
          let nextDay = sortedDays.find(day => day > currentDay);
          if (!nextDay) {
            // Go to next week
            nextDay = sortedDays[0];
            nextDate.setDate(nextDate.getDate() + (7 - currentDay + nextDay));
          } else {
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
          }
        } else {
          nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
        }
        break;
      
      case 'monthly':
        if (pattern.day_of_month) {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          nextDate.setDate(pattern.day_of_month);
        } else {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        }
        break;
      
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    return nextDate;
  };

  const updateSeriesFromDate = async (
    seriesId: string,
    fromDate: string,
    updates: Partial<CreateAppointmentData>
  ) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          title: updates.title,
          patient_id: updates.contact_id,
          start_time: updates.start_time,
          end_time: updates.end_time,
          status: updates.status,
          appointment_type: updates.type,
          notes: updates.notes,
          location: updates.location,
          
        })
        .eq('recurring_appointment_id', seriesId)
        .gte('start_time', fromDate);

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Recurring appointments updated successfully',
      });

      await fetchRecurringSeries();
    } catch (err) {
      console.error('Error updating series:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update series';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const cancelSeriesFromDate = async (seriesId: string, fromDate: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason 
        })
        .eq('recurring_appointment_id', seriesId)
        .gte('start_time', fromDate);

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Recurring appointments cancelled successfully',
      });

      await fetchRecurringSeries();
    } catch (err) {
      console.error('Error cancelling series:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel series';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const createException = async (
    seriesId: string,
    originalDate: string,
    exceptionType: AppointmentException['exception_type'],
    newStartTime?: string,
    newEndTime?: string,
    reason?: string
  ) => {
    try {
      // Create exception record - using appointment_notes as temporary storage
      const { error: exceptionError } = await supabase
        .from('appointment_notes')
        .insert({
          appointment_id: seriesId,
          note: JSON.stringify({
            type: 'exception',
            original_date: originalDate,
            exception_type: exceptionType,
            new_start_time: newStartTime,
            new_end_time: newEndTime,
            reason: reason
          }),
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (exceptionError) throw new Error(exceptionError.message);

      // Update the specific appointment
      if (exceptionType === 'cancelled') {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled', cancellation_reason: reason })
          .eq('recurring_appointment_id', seriesId)
          .eq('start_time', originalDate);
      } else if (exceptionType === 'rescheduled' && newStartTime && newEndTime) {
        await supabase
          .from('appointments')
          .update({ 
            start_time: newStartTime,
            end_time: newEndTime
          })
          .eq('recurring_appointment_id', seriesId)
          .eq('start_time', originalDate);
      }

      toast({
        title: 'Success',
        description: 'Appointment exception created successfully',
      });

      await fetchRecurringSeries();
    } catch (err) {
      console.error('Error creating exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create exception';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchRecurringSeries();
  }, []);

  return {
    series,
    exceptions,
    loading,
    error,
    fetchRecurringSeries,
    createRecurringSeries,
    generateAppointmentInstances,
    updateSeriesFromDate,
    cancelSeriesFromDate,
    createException,
  };
};