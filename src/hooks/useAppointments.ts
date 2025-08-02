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
      console.log('Fetching appointments...');
      const response = await supabase.functions.invoke('ghl-appointments', {
        body: { action: 'getAll' },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Appointments fetched successfully:', response.data);
      
      // Combine GHL and local appointments, preferring local data when available
      const ghlAppointments = response.data.appointments || [];
      const localAppointments = response.data.localAppointments || [];
      
      // Create a map of local appointments by GHL ID for quick lookup
      const localAppointmentMap = new Map(
        localAppointments.map((apt: Appointment) => [apt.ghl_appointment_id, apt])
      );
      
      // Merge appointments, preferring local data when available
      const mergedAppointments = ghlAppointments.map((ghlApt: any) => {
        const localApt = localAppointmentMap.get(ghlApt.id);
        if (localApt) {
          return {
            ...(localApt as Appointment),
            contact_name: ghlApt.contactName || (localApt as any).contact_name,
          } as Appointment;
        }
        
        // Convert GHL appointment to our format
        return {
          id: ghlApt.id,
          ghl_appointment_id: ghlApt.id,
          title: ghlApt.title || '',
          contact_id: ghlApt.contactId || '',
          contact_name: ghlApt.contactName || '',
          start_time: ghlApt.startTime || '',
          end_time: ghlApt.endTime || '',
          status: (ghlApt.appointmentStatus || 'scheduled') as Appointment['status'],
          type: 'consultation' as const,
          notes: ghlApt.notes || '',
          location: ghlApt.location || '',
          created_at: ghlApt.dateAdded || new Date().toISOString(),
          updated_at: ghlApt.dateUpdated || new Date().toISOString(),
        } as Appointment;
      });
      
      // Add any local appointments that don't have GHL IDs
      const localOnlyAppointments = localAppointments.filter(
        (apt: Appointment) => !apt.ghl_appointment_id
      );
      
      const allAppointments = [...mergedAppointments, ...localOnlyAppointments];
      
      // Sort by start time
      allAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setAppointments(allAppointments);
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
      
      const response = await supabase.functions.invoke('ghl-appointments', {
        body: { 
          action: 'create',
          appointmentData,
          calendarId: appointmentData.calendarId
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Appointment created successfully:', response.data);
      
      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return response.data;
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
      
      const response = await supabase.functions.invoke('ghl-appointments', {
        body: { 
          action: 'update',
          appointmentId,
          appointmentData
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Appointment updated successfully:', response.data);
      
      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return response.data;
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
      
      const response = await supabase.functions.invoke('ghl-appointments', {
        body: { 
          action: 'delete',
          appointmentId
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Appointment deleted successfully');
      
      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return response.data;
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

  const syncAppointments = async () => {
    setLoading(true);
    try {
      console.log('Syncing appointments with GoHighLevel...');
      
      const response = await supabase.functions.invoke('ghl-appointments', {
        body: { action: 'sync' },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Sync completed:', response.data);
      
      toast({
        title: 'Sync Complete',
        description: `Synced ${response.data.syncedCount} appointments from GoHighLevel`,
      });
      
      // Refresh appointments list
      await fetchAppointments();
      
      return response.data;
    } catch (err) {
      console.error('Error syncing appointments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync appointments';
      setError(errorMessage);
      toast({
        title: 'Sync Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
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
    syncAppointments,
  };
};