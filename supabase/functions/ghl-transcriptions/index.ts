import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";

interface TranscriptionData {
  id: string;
  text?: string;
  status?: string;
  confidence?: number;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
    const messageId = url.searchParams.get('messageId');
    
    if (!recordingId && !messageId) {
      return new Response(
        JSON.stringify({ error: 'Recording ID or Message ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching transcription for recordingId: ${recordingId}, messageId: ${messageId}`);

    let transcriptionUrl: string;
    
    if (recordingId) {
      // Fetch transcription for call recording
      transcriptionUrl = `${GHL_API_BASE}/conversations/recordings/${recordingId}/transcription`;
    } else {
      // Fetch transcription for voicemail message
      transcriptionUrl = `${GHL_API_BASE}/conversations/messages/${messageId}/transcription`;
    }

    const response = await fetch(transcriptionUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Check if it's a 404 (transcription not available)
      if (response.status === 404) {
        console.log('Transcription not available (404)');
        return new Response(
          JSON.stringify({ 
            id: recordingId || messageId,
            text: null,
            status: 'not_available',
            message: 'Transcription not available for this recording'
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      console.error(`Transcription fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch transcription: ${response.statusText}`);
    }

    const transcriptionData: TranscriptionData = await response.json();
    console.log('Transcription data received:', { 
      id: transcriptionData.id, 
      hasText: !!transcriptionData.text,
      status: transcriptionData.status 
    });

    // Format the response
    const result = {
      id: recordingId || messageId,
      text: transcriptionData.text || null,
      status: transcriptionData.status || 'completed',
      confidence: transcriptionData.confidence,
      language: transcriptionData.language || 'en',
      createdAt: transcriptionData.createdAt,
      updatedAt: transcriptionData.updatedAt,
      hasTranscription: !!transcriptionData.text
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
    console.error('Error in ghl-transcriptions function:', error);
    
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