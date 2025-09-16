import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotificationHelpers } from '@/hooks/useNotificationHelpers';
// Mock user data for portfolio demo
const mockUser = { id: "demo-user-123", email: "demo@healthcare.com" };
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from '@/hooks/use-toast';

export const NotificationTestPanel = () => {
  const user = mockUser;
  const { 
    notifyNewMessage, 
    notifyMention, 
    notifySystemUpdate, 
    notifyError,
    notifySuccess 
  } = useNotificationHelpers();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  const testNotifications = [
    {
      id: 'message',
      title: 'Test New Message',
      icon: MessageSquare,
      color: 'blue',
      action: () => user && notifyNewMessage(
        user.id,
        'Dr. Smith',
        'Team Chat',
        'test-chat-id',
        'This is a test message notification'
      )
    },
    {
      id: 'mention',
      title: 'Test Mention',
      icon: UserPlus,
      color: 'orange',
      action: () => user && notifyMention(
        user.id,
        'Sarah Johnson',
        'Patient Discussion',
        'test-chat-id',
        '@you have been mentioned in this conversation'
      )
    },
    {
      id: 'system',
      title: 'Test System Update',
      icon: Bell,
      color: 'green',
      action: () => user && notifySystemUpdate(
        user.id,
        'System Maintenance',
        'System will be down for maintenance at 2 AM EST',
        'normal'
      )
    },
    {
      id: 'error',
      title: 'Test Error Alert',
      icon: AlertCircle,
      color: 'red',
      action: () => user && notifyError(
        user.id,
        'Connection Error',
        'Failed to sync patient data. Please check your connection.',
        'system',
        'error-123'
      )
    },
    {
      id: 'success',
      title: 'Test Success',
      icon: CheckCircle,
      color: 'green',
      action: () => user && notifySuccess(
        user.id,
        'Data Synced',
        'Patient records have been successfully synchronized.',
        'sync',
        'sync-456'
      )
    }
  ];

  const handleTestNotification = async (test: typeof testNotifications[0]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to test notifications",
        variant: "destructive"
      });
      return;
    }

    try {
      await test.action();
      toast({
        title: "Notification Sent",
        description: `Test ${test.title.toLowerCase()} has been sent`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Test
        </CardTitle>
        <CardDescription>
          Test the 100% free notification system with various notification types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={isSupported ? "default" : "destructive"}>
            {isSupported ? "Push Supported" : "Push Not Supported"}
          </Badge>
          <Badge variant={
            permission === 'granted' ? "default" : 
            permission === 'denied' ? "destructive" : "secondary"
          }>
            Permission: {permission}
          </Badge>
        </div>

        {permission !== 'granted' && (
          <Button onClick={requestPermission} className="w-full mb-4">
            Enable Push Notifications
          </Button>
        )}

        <div className="grid gap-2">
          {testNotifications.map((test) => {
            const Icon = test.icon;
            return (
              <Button
                key={test.id}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => handleTestNotification(test)}
              >
                <Icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{test.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Tests {test.id} notification type
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Browser push notifications (when app is closed)</li>
            <li>In-app notifications (when app is open)</li>
            <li>Email notifications (via Supabase)</li>
            <li>Smart batching and quiet hours</li>
            <li>Offline support with background sync</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};