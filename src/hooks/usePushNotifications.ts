import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported || !user) return;

    try {
      console.log('🔍 Checking subscription status for user:', user.id);
      
      // Check browser subscription
      const registration = await navigator.serviceWorker.ready;
      const browserSubscription = await registration.pushManager.getSubscription();
      
      // Check database subscription
      const { data: dbSubscriptions, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error checking database subscription:', error);
        setIsSubscribed(!!browserSubscription);
        return;
      }

      const hasDbSubscription = dbSubscriptions && dbSubscriptions.length > 0;
      console.log('📱 Browser subscription exists:', !!browserSubscription);
      console.log('💾 Database subscription exists:', hasDbSubscription);

      // Cross-reference browser and database states
      if (browserSubscription && hasDbSubscription) {
        // Check if endpoints match
        const dbSub = dbSubscriptions[0];
        const endpointsMatch = dbSub.endpoint === browserSubscription.endpoint;
        
        console.log('🔗 Endpoints match:', endpointsMatch);
        
        if (endpointsMatch) {
          // Perfect sync - both browser and database agree
          setIsSubscribed(true);
        } else {
          // Endpoints don't match - update database with current browser subscription
          console.log('🔄 Syncing mismatched endpoints...');
          await syncSubscription(browserSubscription);
          setIsSubscribed(true);
        }
      } else if (browserSubscription && !hasDbSubscription) {
        // Browser has subscription but database doesn't - save to database
        console.log('💾 Saving browser subscription to database...');
        await syncSubscription(browserSubscription);
        setIsSubscribed(true);
      } else if (!browserSubscription && hasDbSubscription) {
        // Database has subscription but browser doesn't - mark as inactive
        console.log('🗑️ Marking orphaned database subscription as inactive...');
        await supabase
          .from('notification_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id);
        setIsSubscribed(false);
      } else {
        // Neither browser nor database has subscription
        console.log('❌ No subscriptions found');
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [isSupported, user]);

  const syncSubscription = useCallback(async (subscription: any) => {
    if (!user) return;

    try {
      const subscriptionData = JSON.parse(JSON.stringify(subscription));
      
      const { error } = await supabase
        .from('notification_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          user_agent: navigator.userAgent,
          is_active: true
        });

      if (error) {
        console.error('Error syncing subscription:', error);
        throw error;
      }
      
      console.log('✅ Subscription synced successfully');
    } catch (error) {
      console.error('Error syncing subscription:', error);
    }
  }, [user]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Permission Granted",
          description: "You'll now receive push notifications.",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission.",
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported]);

  const generateVAPIDKeys = useCallback(() => {
    // Generate VAPID keys - in production these should be stored securely
    // For demo purposes, we'll use a static key
    const publicKey = 'BPKy1HQy8W_3ZNZk4M4WOGhOjlGHEwCYm0F9wJ8YKQ4nGnYI7e3J8rCXuC9vB8zHrF2mWn4kL7oP6q1R9s0T2uV';
    return publicKey;
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user || permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const publicKey = generateVAPIDKeys();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Save subscription to database
      const subscriptionData = JSON.parse(JSON.stringify(subscription));
      
      const { error } = await supabase
        .from('notification_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          user_agent: navigator.userAgent,
          is_active: true
        });

      if (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }

      setIsSubscribed(true);
      toast({
        title: "Subscribed",
        description: "You're now subscribed to push notifications.",
      });
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe to push notifications.",
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported, user, permission, generateVAPIDKeys]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        const { error } = await supabase
          .from('notification_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing subscription:', error);
        }
      }

      setIsSubscribed(false);
      toast({
        title: "Unsubscribed",
        description: "You're no longer subscribed to push notifications.",
      });
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to unsubscribe from push notifications.",
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported, user]);

  const sendTestNotification = useCallback(async () => {
    if (!isSubscribed) {
      toast({
        title: "Not Subscribed",
        description: "Please subscribe to push notifications first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Send a test notification through the service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Test Notification', {
          body: 'This is a test push notification from Dr. Silverman CRM',
          icon: '/icon-192.png',
          tag: 'test',
          requireInteraction: false
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  }, [isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}