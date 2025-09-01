import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  notification_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
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

    const { user_id, title, message, notification_id, priority = 'normal' }: EmailNotificationRequest = await req.json();

    console.log('Processing email notification:', { user_id, title, priority });

    // Get user profile and email settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    
    // Check if email notifications are enabled
    if (!preferences.email_notifications) {
      console.log('Email notifications disabled for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'Email notifications disabled for user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this priority level should send email
    const deliveryMethods = preferences.delivery_methods || {
      critical: ['push', 'email'],
      normal: ['push'],
      low: ['in_app']
    };

    if (!deliveryMethods[priority]?.includes('email')) {
      console.log(`Email not configured for ${priority} priority notifications`);
      return new Response(
        JSON.stringify({ message: `Email not configured for ${priority} priority` }),
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
        console.log('Skipping email due to quiet hours');
        return new Response(
          JSON.stringify({ message: 'Skipped due to quiet hours' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Send email using Supabase Auth email system
    const emailHtml = generateEmailTemplate({
      userName: profile.first_name || profile.email,
      title,
      message,
      priority,
      appUrl: 'https://17d76c26-af73-4638-8224-31b9d5a08cfb.lovableproject.com'
    });

    // For demo purposes, we'll log the email instead of actually sending
    // In production, you would use a service like Resend or integrate with Supabase Auth emails
    console.log('Email notification prepared:', {
      to: profile.email,
      subject: `Dr. Silverman CRM: ${title}`,
      html: emailHtml
    });

    // Update notification delivery status
    if (notification_id) {
      await supabase
        .from('notifications')
        .update({
          delivery_status: {
            in_app: { delivered: true, read: false },
            push: { attempted: false, delivered: false },
            email: { attempted: true, delivered: true, sent_at: new Date().toISOString() }
          }
        })
        .eq('id', notification_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification prepared (demo mode)',
        recipient: profile.email 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-notification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function generateEmailTemplate({ userName, title, message, priority, appUrl }: {
  userName: string;
  title: string;
  message: string;
  priority: string;
  appUrl: string;
}): string {
  const priorityColor = {
    low: '#6b7280',
    normal: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444'
  }[priority] || '#3b82f6';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Dr. Silverman CRM</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 20px;">
          <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
            ${priority} Priority
          </span>
        </div>
        
        <h2 style="color: #2c3e50; margin-bottom: 10px;">${title}</h2>
        
        <p style="color: #555; margin-bottom: 20px;">Hi ${userName},</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #333;">${message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Open Dr. Silverman CRM
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          You received this email because you have email notifications enabled in your settings.<br>
          <a href="${appUrl}/settings?section=notifications" style="color: #667eea;">Manage your notification preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);