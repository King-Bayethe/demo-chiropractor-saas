import { useMemo } from 'react';
import { SOAPNote } from './useSOAPNotes';

export const useSOAPStats = (soapNotes: SOAPNote[]) => {
  return useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total notes
    const totalNotes = soapNotes.length;

    // Notes this month
    const notesThisMonth = soapNotes.filter(note => {
      const serviceDate = new Date(note.date_of_service);
      return serviceDate >= firstDayOfMonth;
    });

    // Average completion time (mock data)
    const avgCompletionTime = 8.5;

    // Active providers
    const uniqueProviders = new Set(soapNotes.map(note => note.provider_id || note.provider_name));
    const activeProviders = uniqueProviders.size;

    // Completion rate (assuming is_draft false means completed)
    const completedNotes = soapNotes.filter(note => !note.is_draft);
    const completionRate = totalNotes > 0 
      ? Math.round((completedNotes.length / totalNotes) * 100)
      : 0;

    return {
      totalNotes,
      notesThisMonth: notesThisMonth.length,
      avgCompletionTime,
      activeProviders,
      completionRate,
    };
  }, [soapNotes]);
};
