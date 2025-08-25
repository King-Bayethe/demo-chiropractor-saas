import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";

interface RecordingData {
  id: string;
  url?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    if (!apiKey) {
      throw new Error('GoHighLevel API key not configured');
    }

    const url = new URL(req.url);
    const recordingId = url.searchParams.get('recordingId');
    
    if (!recordingId) {
      return new Response(
        JSON.stringify({ error: 'Recording ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching recording: ${recordingId}`);

    // Get recording metadata first
    const metadataResponse = await fetch(`${GHL_API_BASE}/conversations/recordings/${recordingId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });

    if (!metadataResponse.ok) {
      console.error(`Recording metadata fetch failed: ${metadataResponse.status}`);
      throw new Error(`Failed to fetch recording metadata: ${metadataResponse.statusText}`);
    }

    const metadata: RecordingData = await metadataResponse.json();
    console.log('Recording metadata:', metadata);

    if (!metadata.url) {
      throw new Error('Recording URL not available');
    }

    // Check file size if provided
    if (metadata.fileSize && metadata.fileSize > MAX_FILE_SIZE) {
      throw new Error(`Recording file too large: ${metadata.fileSize} bytes (max: ${MAX_FILE_SIZE})`);
    }

    // Download the audio file
    console.log(`Downloading audio from: ${metadata.url}`);
    const audioResponse = await fetch(metadata.url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!audioResponse.ok) {
      console.error(`Audio download failed: ${audioResponse.status}`);
      throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
    }

    const contentLength = audioResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      throw new Error(`Audio file too large: ${contentLength} bytes (max: ${MAX_FILE_SIZE})`);
    }

    // Get audio data as array buffer
    const audioBuffer = await audioResponse.arrayBuffer();
    console.log(`Downloaded audio: ${audioBuffer.byteLength} bytes`);

    // Convert to base64
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Detect content type
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    
    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64Audio}`;

    const result = {
      id: recordingId,
      base64Audio: dataUrl,
      metadata: {
        duration: metadata.duration,
        fileName: metadata.fileName || `recording_${recordingId}`,
        fileSize: audioBuffer.byteLength,
        contentType,
        originalUrl: metadata.url
      }
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ghl-recordings function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});