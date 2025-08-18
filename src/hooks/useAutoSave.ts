import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  key: string;
  data: any;
  onSave?: (data: any) => Promise<void>;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useAutoSave({
  key,
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true
}: AutoSaveOptions) {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);

  // Save to localStorage
  const saveToLocalStorage = useCallback((dataToSave: any) => {
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
      localStorage.setItem(`draft_${key}`, serializedData);
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
    }
  }, [key]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          data: parsed.data,
          timestamp: new Date(parsed.timestamp),
          version: parsed.version || '1.0'
        };
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
    return null;
  }, [key]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${key}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key]);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!enabled || !data) return;

    const currentDataString = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentDataString === lastSavedDataRef.current) return;

    // Save to localStorage immediately
    saveToLocalStorage(data);
    lastSavedDataRef.current = currentDataString;

    // Try to save to server if onSave is provided
    if (onSave) {
      try {
        await onSave(data);
        toast({
          title: "Draft saved",
          description: "Your changes have been automatically saved.",
          duration: 2000,
        });
      } catch (error) {
        // Still have localStorage backup
        console.error('Server auto-save failed:', error);
      }
    } else {
      // Only localStorage save
      if (!isInitialLoadRef.current) {
        toast({
          title: "Draft saved locally",
          description: "Your changes are saved in your browser.",
          duration: 2000,
        });
      }
    }
  }, [data, enabled, onSave, saveToLocalStorage, toast]);

  // Setup auto-save interval
  useEffect(() => {
    if (!enabled) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(performAutoSave, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performAutoSave, interval, enabled]);

  // Save on data change (debounced)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      performAutoSave();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [data, performAutoSave]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled && data) {
        saveToLocalStorage(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, enabled, saveToLocalStorage]);

  return {
    loadDraft: loadFromLocalStorage,
    clearDraft,
    saveNow: performAutoSave,
    hasDraft: () => !!loadFromLocalStorage()
  };
}