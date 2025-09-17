import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Delete existing demo user if it exists
    await supabaseAdmin.auth.admin.deleteUser('a682ae22-1235-4ed0-b2fb-aa86ec79343b');

    // Create demo user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      user_id: 'a682ae22-1235-4ed0-b2fb-aa86ec79343b',
      email: 'demo@testing.com',
      password: 'DemoPortfolio2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Dr. Sarah',
        last_name: 'Martinez',
        role: 'demo'
      }
    });

    if (error) {
      console.error('Error creating demo user:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create profile for the demo user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: 'a682ae22-1235-4ed0-b2fb-aa86ec79343b',
        email: 'demo@testing.com',
        first_name: 'Dr. Sarah',
        last_name: 'Martinez',
        avatar_url: '/lovable-uploads/d20b903a-e010-419b-ae88-29c72575f3ee.png',
        role: 'demo',
        is_active: true,
        phone: '+1 (555) 123-4567',
        language_preference: 'en',
        dark_mode: false,
        email_signature: 'Dr. Sarah Martinez, MD\nChiropractor & Pain Management Specialist\nHealthcare Demo Clinic\nPhone: (555) 123-4567 | Email: demo@testing.com'
      });

    if (profileError) {
      console.error('Error creating demo profile:', profileError);
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});