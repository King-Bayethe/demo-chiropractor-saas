import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Mock user data for portfolio demo
const mockUser = { id: "demo-user-123", email: "demo@healthcare.com" };
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const user = mockUser;
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

  const getVAPIDKey = useCallback(async (): Promise<string | null> => {
    try {
      console.log('🔑 Fetching VAPID key from server...');
      const { data, error } = await supabase.functions.invoke('get-vapid-key');
      
      if (error) {
        console.error('Error fetching VAPID key:', error);
        return null;
      }
      
      if (!data?.vapidPublicKey) {
        console.error('No VAPID key returned from server');
        return null;
      }
      
      const vapidKey = data.vapidPublicKey;
      console.log(`✅ VAPID key fetched: ${vapidKey.length} characters, starts with: ${vapidKey.substring(0, 10)}...`);
      
      // Validate the key format before returning
      if (typeof vapidKey !== 'string' || vapidKey.trim() === '') {
        console.error('VAPID key is not a valid string');
        return null;
      }
      
      return vapidKey;
    } catch (error) {
      console.error('Error getting VAPID key:', error);
      return null;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user || permission !== 'granted') {
      console.log('❌ Cannot subscribe:', { isSupported, hasUser: !!user, permission });
      return false;
    }

    try {
      console.log('🚀 Starting subscription process...');
      
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');
      
      // Get VAPID key from server
      const publicKey = await getVAPIDKey();
      if (!publicKey) {
        throw new Error('Failed to get VAPID key from server');
      }
      
      console.log('🔑 VAPID key obtained, converting to Uint8Array...');
      
      let applicationServerKey: Uint8Array;
      try {
        applicationServerKey = urlBase64ToUint8Array(publicKey);
      } catch (conversionError) {
        console.error('Failed to convert VAPID key to Uint8Array:', conversionError);
        throw new Error(`VAPID key conversion failed: ${conversionError}`);
      }

      console.log('🔑 VAPID key converted successfully, creating subscription...');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });
      
      console.log('📱 Browser subscription created');

      // Save subscription to database
      await syncSubscription(subscription);

      setIsSubscribed(true);
      toast({
        title: "Subscribed",
        description: "You're now subscribed to push notifications.",
      });
      return true;
    } catch (error) {
      console.error('💥 Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: `Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      return false;
    }
  }, [isSupported, user, permission, getVAPIDKey, syncSubscription]);

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
          body: 'This is a test push notification from HealthFlow SaaS',
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
  try {
    console.log(`🔄 Converting VAPID key: ${base64String.length} characters`);
    
    if (!base64String || typeof base64String !== 'string') {
      throw new Error('Invalid base64 string provided');
    }
    
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    console.log(`🔄 Base64 after processing: ${base64.length} characters, padding added: ${padding.length}`);

    let rawData: string;
    try {
      rawData = window.atob(base64);
      console.log(`✅ Successfully decoded base64, raw data length: ${rawData.length}`);
    } catch (atobError) {
      console.error('❌ Failed to decode base64 string:', atobError);
      console.error('Original string:', base64String);
      console.error('Processed string:', base64);
      throw new Error(`Base64 decode failed: ${atobError}`);
    }

    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    console.log(`✅ Successfully converted to Uint8Array: ${outputArray.length} bytes`);
    return outputArray;
  } catch (error) {
    console.error('❌ Error in urlBase64ToUint8Array:', error);
    throw error;
  }
}