import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UnifiedSOAPNote } from '@/types/soap';

// Interface for SOAP notes from database
export interface SOAPNote {
  id: string;
  patient_id: string;
  provider_id?: string;
  provider_name: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  date_of_service: string;
  chief_complaint: string;
  is_draft: boolean;
  subjective_data: any;
  objective_data: any;
  assessment_data: any;
  plan_data: any;
  vital_signs: any;
  // Legacy compatibility
  patients?: any;
}

export function useSOAPNotes() {
  const { toast } = useToast();
  const [soapNotes, setSOAPNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSOAPNotes = async (options?: { limit?: number; offset?: number; search?: string; }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('soap-notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
          search: options?.search || ''
        }
      });

      if (error) throw error;

      if (data && Array.isArray(data.notes)) {
        setSOAPNotes(data.notes);
      } else {
        console.warn('Unexpected data format:', data);
        setSOAPNotes([]);
      }
    } catch (error) {
      console.error('Failed to fetch SOAP notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch SOAP notes');
      toast({
        title: "Error",
        description: "Failed to load SOAP notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSOAPNote = async (noteData: UnifiedSOAPNote): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      console.log('useSOAPNotes createSOAPNote - Received noteData:', noteData);
      console.log('useSOAPNotes createSOAPNote - noteData type and keys:', typeof noteData, Object.keys(noteData || {}));
      
      // Clean and validate data - data is already in unified format
      // Get current user for provider_id
      const { data: { user } } = await supabase.auth.getUser();
      
      const cleanedData = {
        patient_id: noteData.patient_id,
        provider_id: user?.id || null,
        provider_name: noteData.provider_name,
        date_of_service: noteData.date_of_service instanceof Date 
          ? noteData.date_of_service.toISOString()
          : noteData.date_of_service,
        chief_complaint: noteData.chief_complaint || '',
        is_draft: noteData.is_draft || false,
        subjective_data: noteData.subjective_data || {},
        objective_data: noteData.objective_data || {},
        assessment_data: noteData.assessment_data || {},
        plan_data: noteData.plan_data || {},
        appointment_id: noteData.appointment_id || null
      };

      console.log('useSOAPNotes createSOAPNote - Cleaned data before sending:', cleanedData);
      console.log('useSOAPNotes createSOAPNote - Cleaned data JSON size:', JSON.stringify(cleanedData).length, 'characters');
      console.log('useSOAPNotes createSOAPNote - Cleaned data JSON preview:', JSON.stringify(cleanedData).substring(0, 200) + '...');

      console.log('useSOAPNotes createSOAPNote - About to invoke edge function with:', {
        method: 'POST',
        bodySize: JSON.stringify(cleanedData).length,
        bodyPreview: JSON.stringify(cleanedData).substring(0, 100) + '...'
      });

      const { data, error } = await supabase.functions.invoke('soap-notes', {
        body: cleanedData
      });

      console.log('useSOAPNotes createSOAPNote - Edge function response:', { data, error });

      if (error) throw error;

      const newNote = data?.data;
      if (newNote) {
        setSOAPNotes(prev => [newNote, ...prev]);
        toast({
          title: "Success",
          description: "SOAP note created successfully.",
        });
        return newNote;
      } else {
        throw new Error('No note data returned from server');
      }
    } catch (error) {
      console.error('Failed to create SOAP note:', error);
      setError(error instanceof Error ? error.message : 'Failed to create SOAP note');
      toast({
        title: "Error",
        description: "Failed to create SOAP note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSOAPNote = async (noteId: string, updates: Partial<UnifiedSOAPNote>): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('soap-notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: {
          id: noteId,
          ...updates
        }
      });

      if (error) throw error;

      const updatedNote = data?.note;
      if (updatedNote) {
        setSOAPNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        toast({
          title: "Success",
          description: "SOAP note updated successfully.",
        });
        return updatedNote;
      } else {
        throw new Error('No note data returned from server');
      }
    } catch (error) {
      console.error('Failed to update SOAP note:', error);
      setError(error instanceof Error ? error.message : 'Failed to update SOAP note');
      toast({
        title: "Error",
        description: "Failed to update SOAP note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSOAPNote = async (noteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.functions.invoke('soap-notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: { id: noteId }
      });

      if (error) throw error;

      setSOAPNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Success",
        description: "SOAP note deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('Failed to delete SOAP note:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete SOAP note');
      toast({
        title: "Error",
        description: "Failed to delete SOAP note. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSOAPNote = async (noteId: string): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('soap-notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: { id: noteId }
      });

      if (error) throw error;

      return data?.note || null;
    } catch (error) {
      console.error('Failed to get SOAP note:', error);
      setError(error instanceof Error ? error.message : 'Failed to get SOAP note');
      toast({
        title: "Error",
        description: "Failed to load SOAP note. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes on mount
  useEffect(() => {
    fetchSOAPNotes();
  }, []);

  return {
    soapNotes,
    loading,
    error,
    fetchSOAPNotes,
    createSOAPNote,
    updateSOAPNote,
    deleteSOAPNote,
    getSOAPNote
  };
}