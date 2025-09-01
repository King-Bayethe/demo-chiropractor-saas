import React from 'react';
import { Bell, Mail, Smartphone, Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { PushNotificationSetup } from './PushNotificationSetup';
import { NotificationTestPanel } from './NotificationTestPanel';

export const NotificationSettings = () => {
  const {
    preferences,
    loading,
    saving,
    updatePreference,
    updateQuietHours,
    updateDeliveryMethod,
    savePreferences,
    isInQuietHours
  } = useNotificationSettings();

  const handleSave = () => {
    savePreferences(preferences);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationTestPanel />
      <PushNotificationSetup />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
            {isInQuietHours() && (
              <Badge variant="secondary" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Quiet Hours
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive new messages
                </p>
              </div>
              <Switch
                checked={preferences.new_messages}
                onCheckedChange={(checked) => updatePreference('new_messages', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};