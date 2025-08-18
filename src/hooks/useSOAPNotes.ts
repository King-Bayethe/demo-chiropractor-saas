import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SOAPNote {
  id: string;
  patient_id: string;
  provider_id: string;
  provider_name: string;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
  date_of_service: string;
  chief_complaint?: string;
  is_draft: boolean;
  subjective_data: any;
  objective_data: any;
  assessment_data: any;
  plan_data: any;
  vital_signs?: any;
  created_by: string;
  last_modified_by: string;
  patients?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSOAPNoteData {
  patient_id: string;
  provider_name: string;
  appointment_id?: string;
  date_of_service?: Date;
  chief_complaint?: string;
  is_draft?: boolean;
  subjective_data: any;
  objective_data: any;
  assessment_data: any;
  plan_data: any;
  vital_signs?: any;
}

export function useSOAPNotes() {
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSOAPNotes = async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching SOAP notes with options:', options);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session?.access_token) {
        console.error('No valid session found');
        throw new Error('Not authenticated - please log in');
      }

      const searchParams = new URLSearchParams();
      if (options?.limit) searchParams.set('limit', options.limit.toString());
      if (options?.offset) searchParams.set('offset', options.offset.toString());
      if (options?.search) searchParams.set('search', options.search);

      const queryString = searchParams.toString();
      const functionName = queryString ? `soap-notes?${queryString}` : 'soap-notes';

      console.log('Invoking function:', functionName);

      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log('Successfully fetched SOAP notes:', data);
      setSoapNotes(data.data || []);
      return { data: data.data || [], count: data.count || 0 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOAP notes';
      setError(errorMessage);
      console.error('Error fetching SOAP notes:', err);
      return { data: [], count: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createSOAPNote = async (noteData: CreateSOAPNoteData): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('soap-notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: {
          ...noteData,
          date_of_service: noteData.date_of_service?.toISOString() || new Date().toISOString()
        }
      });

      if (error) throw error;

      const newNote = data.data;
      setSoapNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create SOAP note';
      setError(errorMessage);
      console.error('Error creating SOAP note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSOAPNote = async (noteId: string, updates: Partial<CreateSOAPNoteData>): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke(`soap-notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: updates
      });

      if (error) throw error;

      const updatedNote = data.data;
      setSoapNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return updatedNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update SOAP note';
      setError(errorMessage);
      console.error('Error updating SOAP note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSOAPNote = async (noteId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.functions.invoke(`soap-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      setSoapNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete SOAP note';
      setError(errorMessage);
      console.error('Error deleting SOAP note:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSOAPNote = async (noteId: string): Promise<SOAPNote | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching individual SOAP note:', noteId);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session?.access_token) {
        console.error('No valid session found');
        throw new Error('Not authenticated - please log in');
      }

      console.log('Making function call for note ID:', noteId);

      const { data, error } = await supabase.functions.invoke(`soap-notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log('Successfully fetched SOAP note:', data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOAP note';
      setError(errorMessage);
      console.error('Error fetching SOAP note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-load SOAP notes on hook initialization
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
    getSOAPNote,
  };
}