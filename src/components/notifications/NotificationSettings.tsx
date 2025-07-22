import React, { useState } from 'react';
import { Bell, MessageSquare, UserPlus, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  newMessages: boolean;
  mentions: boolean;
  newChats: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newMessages: true,
    mentions: true,
    newChats: true,
    systemUpdates: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const [loading, setLoading] = useState(false);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save preferences to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Notification preferences saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Success",
          description: "Browser notifications enabled"
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Browser notifications require permission to work",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Platform Notifications</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="new-messages" className="text-sm font-medium">
                      New Messages
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                </div>
                <Switch
                  id="new-messages"
                  checked={preferences.newMessages}
                  onCheckedChange={(checked) => handlePreferenceChange('newMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 text-muted-foreground">@</span>
                  <div>
                    <Label htmlFor="mentions" className="text-sm font-medium">
                      Mentions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when someone mentions you
                    </p>
                  </div>
                </div>
                <Switch
                  id="mentions"
                  checked={preferences.mentions}
                  onCheckedChange={(checked) => handlePreferenceChange('mentions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="new-chats" className="text-sm font-medium">
                      New Conversations
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you're added to new conversations
                    </p>
                  </div>
                </div>
                <Switch
                  id="new-chats"
                  checked={preferences.newChats}
                  onCheckedChange={(checked) => handlePreferenceChange('newChats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="system-updates" className="text-sm font-medium">
                      System Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about system maintenance and updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="system-updates"
                  checked={preferences.systemUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange('systemUpdates', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Delivery Methods</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications in your browser
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="push-notifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  />
                  {preferences.pushNotifications && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestNotificationPermission}
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};