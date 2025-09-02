import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    
    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'VAPID key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate VAPID key format
    if (typeof vapidPublicKey !== 'string' || vapidPublicKey.trim() === '') {
      console.error('VAPID_PUBLIC_KEY is not a valid string');
      return new Response(
        JSON.stringify({ error: 'VAPID key format invalid' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log key length and first few characters for debugging (safe)
    console.log(`VAPID key length: ${vapidPublicKey.length}, starts with: ${vapidPublicKey.substring(0, 10)}...`);
    
    // Validate base64 format
    try {
      // Test if it's valid base64 by trying to decode it
      const testDecode = atob(vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/'));
      console.log(`VAPID key decoded successfully, decoded length: ${testDecode.length}`);
    } catch (decodeError) {
      console.error('VAPID key is not valid base64:', decodeError);
      return new Response(
        JSON.stringify({ error: 'VAPID key is not valid base64' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Providing validated VAPID public key');
    
    return new Response(
      JSON.stringify({ 
        vapidPublicKey: vapidPublicKey,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get VAPID key' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});