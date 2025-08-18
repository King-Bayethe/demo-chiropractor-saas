import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  chiefComplaint: string;
  patientAge?: number;
  patientGender?: string;
  symptoms?: string[];
  medicalHistory?: string[];
}

interface SuggestionResponse {
  suggestedTemplates: string[];
  aiInsights: {
    possibleDiagnoses: string[];
    recommendedQuestions: string[];
    clinicalNotes: string;
    urgencyLevel: 'low' | 'medium' | 'high';
  };
  autocompletions: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data }: { action: string } & AnalyzeRequest = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let response: SuggestionResponse;

    switch (action) {
      case 'analyze':
        response = await analyzeChiefComplaint(data, geminiApiKey);
        break;
      case 'suggest_templates':
        response = await suggestTemplates(data, geminiApiKey);
        break;
      case 'autocomplete':
        response = await generateAutocompletions(data, geminiApiKey);
        break;
      default:
        throw new Error('Invalid action specified');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in gemini-smart-templates:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeChiefComplaint(data: AnalyzeRequest, apiKey: string): Promise<SuggestionResponse> {
  const prompt = `As an experienced healthcare provider, analyze this patient presentation:

Chief Complaint: ${data.chiefComplaint}
${data.patientAge ? `Age: ${data.patientAge}` : ''}
${data.patientGender ? `Gender: ${data.patientGender}` : ''}
${data.symptoms ? `Additional Symptoms: ${data.symptoms.join(', ')}` : ''}
${data.medicalHistory ? `Medical History: ${data.medicalHistory.join(', ')}` : ''}

Provide analysis in this JSON format:
{
  "suggestedTemplates": ["template1", "template2", "template3"],
  "aiInsights": {
    "possibleDiagnoses": ["diagnosis1", "diagnosis2"],
    "recommendedQuestions": ["question1", "question2"],
    "clinicalNotes": "Clinical reasoning and important considerations",
    "urgencyLevel": "low|medium|high"
  },
  "autocompletions": {
    "subjective": "Relevant subjective findings to explore",
    "objective": "Key objective findings to assess",
    "assessment": "Initial clinical impression",
    "plan": "Recommended treatment approach"
  }
}

Focus on evidence-based medicine and standard clinical protocols.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const generatedText = result.candidates[0].content.parts[0].text;
  
  try {
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', parseError);
    // Fallback response
    return {
      suggestedTemplates: ['general-assessment'],
      aiInsights: {
        possibleDiagnoses: ['Further evaluation needed'],
        recommendedQuestions: ['Please describe your symptoms in more detail'],
        clinicalNotes: 'Unable to analyze with current information',
        urgencyLevel: 'medium'
      },
      autocompletions: {}
    };
  }
}

async function suggestTemplates(data: AnalyzeRequest, apiKey: string): Promise<SuggestionResponse> {
  return analyzeChiefComplaint(data, apiKey);
}

async function generateAutocompletions(data: AnalyzeRequest, apiKey: string): Promise<SuggestionResponse> {
  const prompt = `Generate SOAP note autocompletions for:
Chief Complaint: ${data.chiefComplaint}

Provide professional clinical language for each SOAP section:
{
  "autocompletions": {
    "subjective": "Patient-reported symptoms and history",
    "objective": "Physical examination findings",
    "assessment": "Clinical impression and diagnosis",
    "plan": "Treatment and follow-up recommendations"
  }
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const generatedText = result.candidates[0].content.parts[0].text;
  
  try {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        suggestedTemplates: [],
        aiInsights: {
          possibleDiagnoses: [],
          recommendedQuestions: [],
          clinicalNotes: '',
          urgencyLevel: 'low'
        },
        autocompletions: parsed.autocompletions || {}
      };
    }
  } catch (parseError) {
    console.error('Failed to parse autocompletion response:', parseError);
  }
  
  return {
    suggestedTemplates: [],
    aiInsights: {
      possibleDiagnoses: [],
      recommendedQuestions: [],
      clinicalNotes: '',
      urgencyLevel: 'low'
    },
    autocompletions: {}
  };
}