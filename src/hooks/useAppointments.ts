import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoData } from './useDemoData';

export interface Appointment {
  id: string;
  ghl_appointment_id?: string;
  title: string;
  contact_id: string;
  contact_name?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  type: 'initial_consultation' | 'follow_up_visit' | 'annual_physical' | 'wellness_exam' | 'diagnostic_procedure' | 'therapy_session' | 'lab_work' | 'telemedicine' | 'urgent_care' | 'specialist_consultation' | 'vaccination' | 'preventive_care';
  notes?: string;
  location?: string;
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
  
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isDemoUser, mockAppointments } = useDemoData();

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If demo user, return mock data
      if (isDemoUser) {
        const transformedMockAppointments: Appointment[] = mockAppointments.map((apt: any) => ({
          id: apt.id,
          ghl_appointment_id: apt.ghl_appointment_id,
          title: apt.title,
          contact_id: apt.patient_id || '',
          contact_name: apt.patient_name || 'Unknown Patient',
          start_time: apt.start_time,
          end_time: apt.end_time,
          status: apt.status,
          type: apt.appointment_type || 'initial_consultation',
          notes: apt.notes,
          location: apt.location,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
        }));
        setAppointments(transformedMockAppointments);
        setLoading(false);
        return;
      }

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
        type: apt.appointment_type || 'initial_consultation',
        notes: apt.notes,
        location: apt.location,
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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

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
          appointment_type: appointmentData.type || 'initial_consultation',
          notes: appointmentData.notes?.trim() || '',
          location: appointmentData.location?.trim() || '',
          confirmation_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Appointment created successfully:', data);
      
      // Create or update opportunity for the appointment
      await createOrUpdateOpportunity(patientData, data);
      
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

  const createOrUpdateOpportunity = async (patientData: any, appointmentData: any) => {
    try {
      // Get current user ID for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Starting createOrUpdateOpportunity with:', { 
        patientId: patientData.id, 
        appointmentTitle: appointmentData.title,
        currentUserId: user.id
      });

      // Check if an opportunity already exists for this patient
      const { data: existingOpportunity, error: fetchError } = await supabase
        .from('opportunities')
        .select('id, pipeline_stage')
        .eq('patient_id', patientData.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing opportunity:', fetchError);
        throw new Error(`Failed to fetch existing opportunity: ${fetchError.message}`);
      }

      const patientName = patientData.first_name && patientData.last_name 
        ? `${patientData.first_name} ${patientData.last_name}`.trim()
        : patientData.email || 'Unknown Patient';

      if (existingOpportunity) {
        console.log('Updating existing opportunity:', existingOpportunity.id);
        // Update existing opportunity to appointment stage
        const { data: updatedData, error: updateError } = await supabase
          .from('opportunities')
          .update({
            pipeline_stage: 'appointment',
            consultation_scheduled_at: appointmentData.start_time,
            assigned_to: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOpportunity.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating opportunity:', updateError);
          throw new Error(`Failed to update opportunity: ${updateError.message}`);
        } else {
          console.log('Successfully updated existing opportunity to appointment stage:', updatedData);
          return updatedData;
        }
      } else {
        console.log('Creating new opportunity for patient:', patientName);
        // Create new opportunity in appointment stage
        const { data: newOpportunity, error: createError } = await supabase
          .from('opportunities')
          .insert({
            name: `Appointment - ${patientName}`,
            description: `Opportunity created from appointment: ${appointmentData.title}`,
            patient_id: patientData.id,
            patient_name: patientName,
            patient_email: patientData.email || null,
            patient_phone: patientData.phone || null,
            pipeline_stage: 'appointment',
            status: 'lead',
            priority: 'medium',
            source: 'Appointment Booking',
            consultation_scheduled_at: appointmentData.start_time,
            created_by: user.id,
            assigned_to: user.id,
            attorney_referred: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating opportunity:', createError);
          throw new Error(`Failed to create opportunity: ${createError.message}`);
        } else {
          console.log('Successfully created new opportunity in appointment stage:', newOpportunity);
          return newOpportunity;
        }
      }
    } catch (err) {
      console.error('Error in createOrUpdateOpportunity:', err);
      // Re-throw the error so it can be handled by the calling function
      throw err;
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
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      // Normalize times to ISO strings to ensure consistent comparison
      const normalizedStartTime = new Date(startTime).toISOString();
      const normalizedEndTime = new Date(endTime).toISOString();

      // Build the query with proper overlap detection:
      // Two time ranges overlap if: start1 < end2 AND start2 < end1
      // For appointments, this means: appointment.start_time < new_end_time AND appointment.end_time > new_start_time
      let query = supabase
        .from('appointments')
        .select('id, start_time, end_time, title')
        .neq('status', 'cancelled')
        .lt('start_time', normalizedEndTime)
        .gt('end_time', normalizedStartTime);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking conflicts:', error);
        return false;
      }

      // Log conflicts for debugging
      if ((data || []).length > 0) {
        console.log('Conflict detected:', {
          newSlot: { startTime: normalizedStartTime, endTime: normalizedEndTime },
          conflictingAppointments: data
        });
      }

      return (data || []).length > 0;
    } catch (err) {
      console.error('Error checking appointment conflicts:', err);
      return false;
    }
  };

  // Function to get available time slots on a specific date
  const getAvailableTimeSlots = async (
    date: string,
    durationMinutes: number = 60
  ): Promise<{ start: string; end: string }[]> => {
    try {
      const slots: { start: string; end: string }[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
        const endTime = `${date}T${hour.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}:00`;
        
        const hasConflict = await checkAppointmentConflicts(startTime, endTime);
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