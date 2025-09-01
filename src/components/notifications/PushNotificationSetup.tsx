import React from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationSetup = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-success text-success-foreground">Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  const getSubscriptionBadge = () => {
    return isSubscribed 
      ? <Badge className="bg-success text-success-foreground">Active</Badge>
      : <Badge variant="outline">Inactive</Badge>;
  };

  const handleToggleSubscription = async () => {
    if (!isSubscribed) {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications even when the app is closed or minimized.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Permission Status</div>
            <div className="mt-1">{getPermissionBadge()}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Subscription Status</div>
            <div className="mt-1">{getSubscriptionBadge()}</div>
          </div>
        </div>

        {permission === 'denied' && (
          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            <strong>Permission Denied:</strong> To enable push notifications, please:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Allow notifications for this site</li>
              <li>Refresh the page</li>
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {permission === 'default' && (
            <Button onClick={requestPermission} variant="outline">
              Request Permission
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button 
              onClick={handleToggleSubscription}
              variant={isSubscribed ? "outline" : "default"}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Button>
          )}
          
          {isSubscribed && (
            <Button 
              onClick={sendTestNotification} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>What you'll receive:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>New messages and mentions in team chats</li>
            <li>Important system updates and alerts</li>
            <li>Appointment reminders and updates</li>
            <li>Critical patient notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};