import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ghlApiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    if (!ghlApiKey) {
      console.error('GHL API key not found');
      return new Response(
        JSON.stringify({ error: 'GHL API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!locationId) {
      console.error('GHL Location ID not found');
      return new Response(
        JSON.stringify({ error: 'GHL Location ID not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching GHL users for location:', locationId);

    // Fetch users from GoHighLevel API
    const ghlResponse = await fetch(`https://services.leadconnectorhq.com/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    if (!ghlResponse.ok) {
      console.error('GHL API error:', ghlResponse.status, await ghlResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users from GoHighLevel' }),
        { 
          status: ghlResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const ghlData = await ghlResponse.json();
    console.log('GHL users fetched successfully:', ghlData.users?.length || 0, 'users');

    // Transform GHL users to our format
    const transformedUsers = (ghlData.users || []).map((user: any) => ({
      id: user.id,
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      email: user.email || '',
      role: user.role || 'staff', // Map GHL roles to our system
      phone: user.phone || '',
      is_active: true
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        users: transformedUsers,
        total: transformedUsers.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ghl-users function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});