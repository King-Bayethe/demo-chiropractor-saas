import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_type: 'email' | 'sms' | 'in_app';
  minutes_before: number;
  status: 'pending' | 'sent' | 'failed';
  message?: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
}

export interface AppointmentNotification {
  id: string;
  appointment_id: string;
  user_id: string;
  type: 'reminder' | 'confirmation' | 'cancellation' | 'reschedule';
  status: 'pending' | 'sent' | 'read';
  message: string;
  scheduled_for: string;
  sent_at?: string;
  created_at: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in_app';
  subject?: string;
  body: string;
  minutes_before: number;
  is_default: boolean;
  created_by: string;
  created_at: string;
}

export const useAppointmentReminders = () => {
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReminders = async (appointmentId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointment_reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw new Error(fetchError.message);

      setReminders((data || []) as AppointmentReminder[]);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reminders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (userId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointment_notifications')
        .select('*')
        .order('scheduled_for', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw new Error(fetchError.message);

      setNotifications((data || []) as AppointmentNotification[]);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData: Omit<AppointmentReminder, 'id' | 'created_at' | 'status' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('appointment_reminders')
        .insert({
          ...reminderData,
          status: 'pending',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Reminder created successfully',
      });

      await fetchReminders();
      return data;
    } catch (err) {
      console.error('Error creating reminder:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const createNotification = async (notificationData: Omit<AppointmentNotification, 'id' | 'created_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('appointment_notifications')
        .insert({
          ...notificationData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      toast({
        title: 'Success',
        description: 'Notification scheduled successfully',
      });

      await fetchNotifications();
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const scheduleAppointmentReminders = async (appointmentId: string, patientId: string, appointmentTime: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Default reminder schedule: 24 hours, 2 hours, and 30 minutes before
      const reminderTimes = [
        { minutes: 24 * 60, type: 'email' as const },
        { minutes: 2 * 60, type: 'sms' as const },
        { minutes: 30, type: 'in_app' as const }
      ];

      const promises = reminderTimes.map(reminder => {
        const scheduledTime = new Date(appointmentTime);
        scheduledTime.setMinutes(scheduledTime.getMinutes() - reminder.minutes);

        return createNotification({
          appointment_id: appointmentId,
          user_id: patientId,
          type: 'reminder',
          message: `Your appointment is scheduled in ${reminder.minutes < 60 ? reminder.minutes + ' minutes' : Math.floor(reminder.minutes / 60) + ' hours'}`,
          scheduled_for: scheduledTime.toISOString()
        });
      });

      await Promise.all(promises);

      toast({
        title: 'Success',
        description: 'Appointment reminders scheduled successfully',
      });
    } catch (err) {
      console.error('Error scheduling reminders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminders';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const sendConfirmationRequest = async (appointmentId: string, patientId: string) => {
    try {
      await createNotification({
        appointment_id: appointmentId,
        user_id: patientId,
        type: 'confirmation',
        message: 'Please confirm your upcoming appointment',
        scheduled_for: new Date().toISOString()
      });

      toast({
        title: 'Success',
        description: 'Confirmation request sent',
      });
    } catch (err) {
      console.error('Error sending confirmation:', err);
      throw err;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) throw new Error(error.message);

      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const getPendingReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_notifications')
        .select(`
          *,
          appointments:appointment_id(
            title,
            start_time,
            patient_id,
            patients:patient_id(first_name, last_name, email, phone)
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString());

      if (error) throw new Error(error.message);

      return data || [];
    } catch (err) {
      console.error('Error getting pending reminders:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchNotifications();
  }, []);

  return {
    reminders,
    notifications,
    templates,
    loading,
    error,
    fetchReminders,
    fetchNotifications,
    createReminder,
    createNotification,
    scheduleAppointmentReminders,
    sendConfirmationRequest,
    markNotificationAsRead,
    getPendingReminders,
  };
};