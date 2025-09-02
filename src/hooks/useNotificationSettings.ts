import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  new_messages: boolean;
  mentions: boolean;
  new_chats: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  delivery_methods: {
    critical: string[];
    high: string[];
    normal: string[];
    low: string[];
  };
}

const defaultPreferences: NotificationPreferences = {
  new_messages: true,
  mentions: true,
  new_chats: true,
  system_updates: true,
  email_notifications: false,
  push_notifications: true,
  quiet_hours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  delivery_methods: {
    critical: ['push', 'email'],
    high: ['push', 'email'],
    normal: ['push'],
    low: ['in_app']
  }
};

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to get existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification preferences:', error);
        return;
      }

      if (data?.notification_preferences) {
        setPreferences({ ...defaultPreferences, ...(data.notification_preferences as any) });
      } else {
        // Create default settings if none exist
        await savePreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    if (!user) return false;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: 'notification_preferences',
          notification_preferences: newPreferences as any
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('Error saving notification preferences:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save notification preferences.",
          variant: "destructive"
        });
        return false;
      }

      setPreferences(newPreferences);
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
      return true;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save notification preferences.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user]);

  const updatePreference = useCallback((key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateQuietHours = useCallback((quietHours: NotificationPreferences['quiet_hours']) => {
    setPreferences(prev => ({
      ...prev,
      quiet_hours: quietHours
    }));
  }, []);

  const updateDeliveryMethod = useCallback((priority: keyof NotificationPreferences['delivery_methods'], methods: string[]) => {
    setPreferences(prev => ({
      ...prev,
      delivery_methods: {
        ...prev.delivery_methods,
        [priority]: methods
      }
    }));
  }, []);

  const isInQuietHours = useCallback(() => {
    if (!preferences.quiet_hours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = preferences.quiet_hours;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= start && currentTime <= end;
  }, [preferences.quiet_hours]);

  const shouldSendNotification = useCallback((type: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') => {
    // Check if notification type is enabled
    const typeEnabled = preferences[type as keyof NotificationPreferences] as boolean;
    if (!typeEnabled) return false;

    // Critical notifications always send (unless explicitly disabled)
    if (priority === 'critical') return true;

    // Check quiet hours for non-critical notifications
    if (isInQuietHours() && (priority as string) !== 'critical') return false;

    return true;
  }, [preferences, isInQuietHours]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    updateQuietHours,
    updateDeliveryMethod,
    savePreferences,
    loadPreferences,
    isInQuietHours,
    shouldSendNotification
  };
};