import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  notification_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      user_id, 
      title, 
      message, 
      entity_type, 
      entity_id, 
      notification_id, 
      priority = 'normal' 
    }: PushNotificationRequest = await req.json();

    console.log('Processing push notification:', { user_id, title, priority });

    // Get user notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('notification_preferences')
      .eq('user_id', user_id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching user settings:', settingsError);
    }

    const preferences = settings?.notification_preferences || {};
    
    // Check if push notifications are enabled
    if (!preferences.push_notifications) {
      console.log('Push notifications disabled for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'Push notifications disabled for user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this priority level should send push
    const deliveryMethods = preferences.delivery_methods || {
      critical: ['push', 'email'],
      normal: ['push'],
      low: ['in_app']
    };

    if (!deliveryMethods[priority]?.includes('push')) {
      console.log(`Push not configured for ${priority} priority notifications`);
      return new Response(
        JSON.stringify({ message: `Push not configured for ${priority} priority` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quiet hours for non-critical notifications
    if (priority !== 'critical' && preferences.quiet_hours?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = preferences.quiet_hours;
      
      let isQuietTime = false;
      if (start > end) {
        // Overnight quiet hours
        isQuietTime = currentTime >= start || currentTime <= end;
      } else {
        // Same-day quiet hours
        isQuietTime = currentTime >= start && currentTime <= end;
      }

      if (isQuietTime) {
        console.log('Skipping push due to quiet hours');
        return new Response(
          JSON.stringify({ message: 'Skipped due to quiet hours' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active push subscriptions for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No active push subscriptions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare push notification payload
    const pushPayload = {
      title,
      message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `notification_${notification_id || Date.now()}`,
      entity_type,
      entity_id,
      notification_id,
      priority,
      timestamp: Date.now()
    };

    // For demo purposes, we'll simulate sending push notifications
    // In production, you would use the Web Push Protocol to send to each subscription
    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        // Simulate push notification sending
        console.log('Sending push notification to:', subscription.endpoint);
        
        // Here you would use a library like 'web-push' to send the actual notification
        // const webpush = require('web-push');
        // await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
        
        results.push({
          subscription_id: subscription.id,
          success: true,
          endpoint: subscription.endpoint
        });

        // Update last used timestamp
        await supabase
          .from('notification_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', subscription.id);

      } catch (error) {
        console.error('Failed to send push notification:', error);
        results.push({
          subscription_id: subscription.id,
          success: false,
          error: error.message,
          endpoint: subscription.endpoint
        });
      }
    }

    // Update notification delivery status
    if (notification_id) {
      const successCount = results.filter(r => r.success).length;
      await supabase
        .from('notifications')
        .update({
          delivery_status: {
            in_app: { delivered: true, read: false },
            push: { 
              attempted: true, 
              delivered: successCount > 0,
              sent_at: new Date().toISOString(),
              success_count: successCount,
              total_subscriptions: subscriptions.length
            },
            email: { attempted: false, delivered: false }
          }
        })
        .eq('id', notification_id);
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Push notifications processed (demo mode)',
        results: {
          total_subscriptions: subscriptions.length,
          successful_sends: successCount,
          failed_sends: results.length - successCount
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);