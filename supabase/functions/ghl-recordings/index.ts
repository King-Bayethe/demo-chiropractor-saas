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

    const { messageId } = await req.json();
    
    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching recording for message: ${messageId}`);

    // Get message details first to find recording info
    const messageResponse = await fetch(`${GHL_API_BASE}/conversations/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });

    if (!messageResponse.ok) {
      console.error(`Message fetch failed: ${messageResponse.status}`);
      throw new Error(`Failed to fetch message: ${messageResponse.statusText}`);
    }

    const messageData = await messageResponse.json();
    console.log('Message data:', messageData);

    // Check for recording in message attachments or meta
    let recordingUrl = null;
    let recordingId = null;
    let duration = null;

    // Check meta for recording info
    if (messageData.meta?.recordingUrl) {
      recordingUrl = messageData.meta.recordingUrl;
      recordingId = messageData.meta.recordingId || messageId;
      duration = messageData.meta.duration;
    }

    // Check attachments for audio files
    if (!recordingUrl && messageData.attachments) {
      const audioAttachment = messageData.attachments.find(att => 
        att.type === 'audio' || att.type?.includes('audio')
      );
      if (audioAttachment) {
        recordingUrl = audioAttachment.url;
        recordingId = audioAttachment.id || messageId;
      }
    }

    if (!recordingUrl) {
      return new Response(
        JSON.stringify({ error: 'No recording found for this message' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found recording URL: ${recordingUrl}`);

    // Fetch the recording file
    const recordingResponse = await fetch(recordingUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!recordingResponse.ok) {
      console.error(`Recording download failed: ${recordingResponse.status}`);
      throw new Error(`Failed to download recording: ${recordingResponse.statusText}`);
    }

    const contentLength = recordingResponse.headers.get('content-length');
    const contentType = recordingResponse.headers.get('content-type') || 'audio/wav';
    
    // Get audio data as array buffer
    const audioBuffer = await recordingResponse.arrayBuffer();
    console.log(`Downloaded recording: ${audioBuffer.byteLength} bytes`);

    // Convert to base64 for data URL
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const dataUrl = `data:${contentType};base64,${base64Audio}`;

    const result = {
      messageId,
      recordingId,
      url: dataUrl,
      originalUrl: recordingUrl,
      metadata: {
        duration,
        fileName: `recording_${messageId}`,
        fileSize: audioBuffer.byteLength,
        contentType,
        fileSizeFormatted: formatFileSize(audioBuffer.byteLength)
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

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}