-- Add notification preferences to user_settings table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'notification_preferences') THEN
    ALTER TABLE public.user_settings ADD COLUMN notification_preferences JSONB DEFAULT '{
      "new_messages": true,
      "mentions": true,
      "new_chats": true,
      "system_updates": true,
      "email_notifications": false,
      "push_notifications": true,
      "quiet_hours": {
        "enabled": false,
        "start": "22:00",
        "end": "08:00"
      },
      "delivery_methods": {
        "critical": ["push", "email"],
        "normal": ["push"],
        "low": ["in_app"]
      }
    }'::jsonb;
  END IF;
END $$;

-- Create notification_subscriptions table for push subscriptions
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for notification subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
ON public.notification_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_notification_subscriptions_updated_at
BEFORE UPDATE ON public.notification_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add email delivery tracking to notifications table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'delivery_status') THEN
    ALTER TABLE public.notifications ADD COLUMN delivery_status JSONB DEFAULT '{
      "in_app": {"delivered": true, "read": false},
      "push": {"attempted": false, "delivered": false},
      "email": {"attempted": false, "delivered": false}
    }'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE public.notifications ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical'));
  END IF;
END $$;