import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GHL_API_BASE = 'https://services.leadconnectorhq.com'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting location diagnostics...')
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get GHL API key from environment
    const ghlApiKey = Deno.env.get('GHL_API_KEY')
    if (!ghlApiKey) {
      throw new Error('GHL_API_KEY not found in environment variables')
    }

    const currentLocationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID')
    console.log('Current GOHIGHLEVEL_LOCATION_ID:', currentLocationId)

    // Fetch locations from GoHighLevel API
    console.log('Fetching locations from GoHighLevel...')
    const ghlResponse = await fetch(`${GHL_API_BASE}/locations/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    })

    console.log('GHL locations response status:', ghlResponse.status)
    const responseText = await ghlResponse.text()
    console.log('GHL locations response:', responseText)

    if (!ghlResponse.ok) {
      if (ghlResponse.status === 401) {
        throw new Error(`GHL API authentication failed. Status: ${ghlResponse.status}. Response: ${responseText}`)
      } else if (ghlResponse.status === 403) {
        throw new Error(`GHL API access denied. Status: ${ghlResponse.status}. Response: ${responseText}`)
      } else {
        throw new Error(`GHL API error. Status: ${ghlResponse.status}. Response: ${responseText}`)
      }
    }

    const data = JSON.parse(responseText)
    console.log('Parsed locations data:', JSON.stringify(data, null, 2))

    // Extract locations array
    const locations = data.locations || []
    
    // Find the current location if it exists
    const currentLocation = locations.find((loc: any) => loc.id === currentLocationId)
    
    return new Response(JSON.stringify({
      success: true,
      currentLocationId,
      currentLocationFound: !!currentLocation,
      currentLocationName: currentLocation?.name || 'Not found',
      totalLocationsFound: locations.length,
      availableLocations: locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        domain: loc.domain,
        website: loc.website
      })),
      recommendation: locations.length > 0 ? 
        `Use location ID: ${locations[0].id} (${locations[0].name})` : 
        'No locations found - check API key permissions',
      instructions: currentLocation ? 
        'Your current location ID is valid and accessible!' :
        'Your current location ID is not accessible. Use one of the available location IDs above.'
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in ghl-locations function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check the function logs for more information'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})