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
      // VAPID public keys should be URL-safe base64, typically 65 characters long
      let keyToTest = vapidPublicKey;
      
      // If it's URL-safe base64, convert to regular base64 for testing
      if (keyToTest.includes('-') || keyToTest.includes('_')) {
        keyToTest = keyToTest.replace(/-/g, '+').replace(/_/g, '/');
      }
      
      // Add padding if needed
      while (keyToTest.length % 4) {
        keyToTest += '=';
      }
      
      console.log(`Testing VAPID key format: length=${keyToTest.length}, padded=${keyToTest !== vapidPublicKey}`);
      
      // Test if it's valid base64 by trying to decode it
      const testDecode = atob(keyToTest);
      console.log(`VAPID key decoded successfully, decoded length: ${testDecode.length}`);
      
      // VAPID public keys should decode to 65 bytes
      if (testDecode.length !== 65) {
        console.warn(`VAPID key decoded to ${testDecode.length} bytes, expected 65`);
      }
    } catch (decodeError) {
      console.error('VAPID key is not valid base64:', decodeError);
      console.error('Key value (first 20 chars):', vapidPublicKey.substring(0, 20));
      return new Response(
        JSON.stringify({ 
          error: 'VAPID key is not valid base64',
          details: decodeError.message,
          keyLength: vapidPublicKey.length 
        }), 
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