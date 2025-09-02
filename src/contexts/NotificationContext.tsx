import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'mention';
  read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_by?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  delivery_status?: any;
  created_at: string;
  updated_at: string;
}

interface PendingNotification {
  notification: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>;
  resolve: (value: Notification | null) => void;
  reject: (error: any) => void;
  attempts: number;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>) => Promise<Notification | null>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingQueue = useRef<PendingNotification[]>([]);
  const isProcessingQueue = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  // Validate authentication state before creating notifications
  const validateAuth = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user?.id;
    } catch (error) {
      console.error('Auth validation failed:', error);
      return false;
    }
  }, []);

  // Process pending notifications queue
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || pendingQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    const queue = [...pendingQueue.current];
    pendingQueue.current = [];

    for (const item of queue) {
      try {
        const isAuth = await validateAuth();
        if (!isAuth) {
          // Requeue if still not authenticated but within retry limits
          if (item.attempts < 3 && Date.now() - item.timestamp < 30000) {
            item.attempts++;
            pendingQueue.current.push(item);
          } else {
            item.reject(new Error('Authentication timeout'));
          }
          continue;
        }

        const result = await createNotificationDirect(item.notification);
        item.resolve(result);
      } catch (error) {
        if (item.attempts < 3) {
          item.attempts++;
          pendingQueue.current.push(item);
        } else {
          item.reject(error);
        }
      }
    }

    isProcessingQueue.current = false;

    // Process any remaining items after a delay
    if (pendingQueue.current.length > 0) {
      setTimeout(processQueue, 1000);
    }
  }, []);

  // Direct notification creation without queue
  const createNotificationDirect = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<Notification | null> => {
    try {
      // Validate authentication state first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated or session invalid');
      }

      console.log('Creating notification - Auth state:', {
        sessionUserId: session.user.id,
        targetUserId: notification.user_id,
        type: notification.type,
        title: notification.title
      });

      // Create notification with explicit created_by matching session user
      const insertData = {
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        entity_type: notification.entity_type,
        entity_id: notification.entity_id,
        priority: notification.priority || 'normal',
        created_by: session.user.id // This must match auth.uid() for RLS policy
      };

      console.log('Inserting notification data:', insertData);

      const { data, error } = await supabase
        .from('notifications')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error creating notification:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          sessionUserId: session.user.id,
          insertData
        });
        throw error;
      }
      
      console.log('Notification created successfully:', data);
      return data as Notification;
    } catch (error) {
      console.error('Error in createNotificationDirect:', error);
      throw error;
    }
  }, []);

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<Notification | null> => {
    try {
      // First attempt direct creation
      const isAuth = await validateAuth();
      
      if (isAuth) {
        return await createNotificationDirect(notification);
      }

      // If not authenticated, queue the notification
      console.warn('Auth not ready, queueing notification:', notification.title);
      
      return new Promise((resolve, reject) => {
        pendingQueue.current.push({
          notification,
          resolve,
          reject,
          attempts: 0,
          timestamp: Date.now()
        });

        // Start processing queue
        setTimeout(processQueue, 100);
      });

    } catch (error) {
      console.error('Error creating notification:', error);
      
      // Show user-friendly error message
      toast({
        title: "Notification Error",
        description: "Failed to create notification. Please check your connection.",
        variant: "destructive"
      });
      
      return null;
    }
  }, [validateAuth, createNotificationDirect, processQueue, toast]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  }, [toast]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show toast for new notifications
            if (newNotification.created_by !== user.id) {
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: newNotification.type === 'error' ? 'destructive' : 'default'
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev =>
              prev.map(notification =>
                notification.id === updatedNotification.id
                  ? updatedNotification
                  : notification
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        createNotification,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};