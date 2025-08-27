import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  ghl_appointment_id?: string;
  title: string;
  contact_id: string;
  contact_name?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type: 'consultation' | 'treatment' | 'follow_up' | 'procedure';
  notes?: string;
  location?: string;
  provider_id?: string;
  provider_name?: string;
  created_at: string;
  updated_at: string;
  appointment_notes?: AppointmentNote[];
}

export interface AppointmentNote {
  id: string;
  appointment_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface CreateAppointmentData {
  title: string;
  contact_id: string;
  start_time: string;
  end_time: string;
  status?: Appointment['status'];
  type?: Appointment['type'];
  notes?: string;
  location?: string;
  provider_id?: string;
  calendarId?: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching appointments from Supabase...');
      
      // Fetch appointments first
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (appointmentsError) {
        throw new Error(appointmentsError.message);
      }

      console.log('Appointments fetched successfully:', appointmentsData);
      
      // Transform data to match our interface
      const transformedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        ghl_appointment_id: apt.ghl_appointment_id,
        title: apt.title,
        contact_id: apt.patient_id || '',
        contact_name: apt.patient_name || 'Unknown Patient',
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        type: apt.appointment_type || 'consultation',
        notes: apt.notes,
        location: apt.location,
        provider_id: apt.provider_id,
        provider_name: apt.provider_name || 'Unknown Provider',
        created_at: apt.created_at,
        updated_at: apt.updated_at,
      }));
      
      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments';
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

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    setLoading(true);
    try {
      console.log('Creating appointment:', appointmentData);
      
      // Get current user for provider info if not specified
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user profile for provider name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('user_id', user.id)
        .single();

      const providerName = profile ? 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email :
        'Unknown Provider';

      // Validate required fields
      if (!appointmentData.title?.trim()) {
        throw new Error('Appointment title is required');
      }
      if (!appointmentData.contact_id) {
        throw new Error('Patient selection is required');
      }
      if (!appointmentData.start_time || !appointmentData.end_time) {
        throw new Error('Start and end times are required');
      }

      // Verify patient exists
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .eq('id', appointmentData.contact_id)
        .single();

      if (patientError || !patientData) {
        throw new Error('Selected patient not found');
      }

      const patientName = patientData.first_name && patientData.last_name 
        ? `${patientData.first_name} ${patientData.last_name}`
        : patientData.email || 'Unknown Patient';

      // Create appointment in Supabase
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          title: appointmentData.title.trim(),
          patient_id: appointmentData.contact_id,
          patient_name: patientName,
          patient_email: patientData.email,
          start_time: appointmentData.start_time,
          end_time: appointmentData.end_time,
          status: appointmentData.status || 'scheduled',
          appointment_type: appointmentData.type || 'consultation',
          notes: appointmentData.notes?.trim() || '',
          location: appointmentData.location?.trim() || '',
          provider_id: appointmentData.provider_id || user.id,
          provider_name: providerName,
          confirmation_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Appointment created successfully:', data);
      
      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return data;
    } catch (err) {
      console.error('Error creating appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
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

  const updateAppointment = async (appointmentId: string, appointmentData: Partial<CreateAppointmentData>) => {
    setLoading(true);
    try {
      console.log('Updating appointment:', appointmentId, appointmentData);
      
      // Update appointment in Supabase
      const updateData: any = {};
      
      if (appointmentData.title) updateData.title = appointmentData.title;
      if (appointmentData.contact_id) updateData.patient_id = appointmentData.contact_id;
      if (appointmentData.start_time) updateData.start_time = appointmentData.start_time;
      if (appointmentData.end_time) updateData.end_time = appointmentData.end_time;
      if (appointmentData.status) updateData.status = appointmentData.status;
      if (appointmentData.type) updateData.appointment_type = appointmentData.type;
      if (appointmentData.notes) updateData.notes = appointmentData.notes;
      if (appointmentData.location) updateData.location = appointmentData.location;
      if (appointmentData.provider_id) updateData.provider_id = appointmentData.provider_id;

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Appointment updated successfully:', data);
      
      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return data;
    } catch (err) {
      console.error('Error updating appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
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

  const deleteAppointment = async (appointmentId: string) => {
    setLoading(true);
    try {
      console.log('Deleting appointment:', appointmentId);
      
      // Delete appointment from Supabase
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('Appointment deleted successfully');
      
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
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

  // Validation function to check appointment conflicts
  const checkAppointmentConflicts = async (
    startTime: string,
    endTime: string,
    providerId?: string,
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      let query = supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .neq('status', 'cancelled')
        .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking conflicts:', error);
        return false;
      }

      return (data || []).length > 0;
    } catch (err) {
      console.error('Error checking appointment conflicts:', err);
      return false;
    }
  };

  // Function to get available time slots for a provider on a specific date
  const getAvailableTimeSlots = async (
    providerId: string,
    date: string,
    durationMinutes: number = 60
  ): Promise<{ start: string; end: string }[]> => {
    try {
      // This is a simplified version - in a real implementation,
      // you'd check provider availability and existing appointments
      const slots: { start: string; end: string }[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
        const endTime = `${date}T${hour.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}:00`;
        
        const hasConflict = await checkAppointmentConflicts(startTime, endTime, providerId);
        if (!hasConflict) {
          slots.push({ start: startTime, end: endTime });
        }
      }
      
      return slots;
    } catch (err) {
      console.error('Error getting available time slots:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    checkAppointmentConflicts,
    getAvailableTimeSlots,
  };
};