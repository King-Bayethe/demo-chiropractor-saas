import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingQueue = useRef<PendingNotification[]>([]);
  const isProcessingQueue = useRef(false);

  // Mock user ID for portfolio demo
  const mockUserId = 'demo-user-id';

  const fetchNotifications = useCallback(async () => {
    try {
      // For portfolio demo, use mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: mockUserId,
          title: 'Demo Notification',
          message: 'This is a demo notification for the portfolio.',
          type: 'info',
          read: false,
          priority: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
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
    try {
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
  }, [toast]);

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<Notification | null> => {
    try {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.type === 'error' ? 'destructive' : 'default'
      });
      
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      
      toast({
        title: "Notification Error",
        description: "Failed to create notification. Please check your connection.",
        variant: "destructive"
      });
      
      return null;
    }
  }, [toast]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
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