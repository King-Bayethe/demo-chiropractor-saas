import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

interface AnalysisRequest {
  action: 'analyze' | 'drugInteraction' | 'complianceCheck' | 'billingCodes' | 'realtimeSuggestion';
  chiefComplaint?: string;
  medications?: string[];
  diagnoses?: string[];
  treatments?: string[];
  formData?: any;
  currentField?: string;
  currentValue?: string;
}

interface AIInsights {
  possibleDiagnoses: string[];
  recommendedQuestions: string[];
  clinicalNotes: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

interface ComplianceWarning {
  guideline: string;
  issue: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
}

interface BillingCode {
  code: string;
  type: 'ICD-10' | 'CPT';
  description: string;
  confidence: number;
}

interface RealtimeSuggestion {
  suggestions: string[];
  type: 'completion' | 'correction' | 'enhancement';
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, chiefComplaint, medications, diagnoses, treatments, formData, currentField, currentValue }: AnalysisRequest = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let prompt = '';
    let responseStructure = '';

    switch (action) {
      case 'analyze':
        prompt = `As a medical AI assistant, analyze this chief complaint: "${chiefComplaint}"

Please provide a comprehensive analysis including:
1. Possible diagnoses (differential diagnosis)
2. Key questions to ask the patient during examination
3. Clinical notes and considerations
4. Urgency level assessment (low/medium/high)

Focus on evidence-based medicine and clinical best practices.`;
        
        responseStructure = `Respond in this JSON format:
{
  "possibleDiagnoses": ["diagnosis1", "diagnosis2", "diagnosis3"],
  "recommendedQuestions": ["question1", "question2", "question3"],
  "clinicalNotes": "Clinical assessment and considerations",
  "urgencyLevel": "low|medium|high"
}`;
        break;

      case 'drugInteraction':
        prompt = `As a clinical pharmacist AI, analyze these medications for potential interactions: ${medications?.join(', ')}

Check for:
1. Drug-drug interactions
2. Severity levels (minor/moderate/major)
3. Clinical significance
4. Recommendations for management

Provide evidence-based interaction analysis.`;

        responseStructure = `Respond in this JSON format:
{
  "interactions": [
    {
      "medication1": "drug name",
      "medication2": "drug name", 
      "severity": "minor|moderate|major",
      "description": "interaction description",
      "recommendation": "clinical recommendation"
    }
  ],
  "hasInteractions": true|false,
  "summary": "overall assessment"
}`;
        break;

      case 'complianceCheck':
        prompt = `As a clinical guidelines AI expert, review this clinical case for guideline compliance:

Chief Complaint: ${chiefComplaint}
Diagnoses: ${diagnoses?.join(', ')}
Treatments: ${treatments?.join(', ')}

Check against major clinical guidelines (ACP, AHA, CDC, etc.) for:
1. Diagnostic criteria adherence
2. Treatment recommendation compliance
3. Missing standard assessments
4. Best practice violations`;

        responseStructure = `Respond in this JSON format:
{
  "warnings": [
    {
      "guideline": "guideline name",
      "issue": "compliance issue",
      "recommendation": "corrective action",
      "severity": "info|warning|critical"
    }
  ],
  "overallCompliance": "excellent|good|needs_improvement|poor",
  "summary": "compliance assessment summary"
}`;
        break;

      case 'billingCodes':
        prompt = `As a medical coding AI specialist, suggest appropriate billing codes for:

Chief Complaint: ${chiefComplaint}
Diagnoses: ${diagnoses?.join(', ')}
Treatments/Procedures: ${treatments?.join(', ')}

Provide:
1. ICD-10 diagnosis codes
2. CPT procedure codes
3. Confidence levels
4. Coding rationale`;

        responseStructure = `Respond in this JSON format:
{
  "codes": [
    {
      "code": "code number",
      "type": "ICD-10|CPT",
      "description": "code description",
      "confidence": 0.9
    }
  ],
  "codingNotes": "special considerations for coding",
  "totalRVU": "estimated RVU if applicable"
}`;
        break;

      case 'realtimeSuggestion':
        prompt = `As a medical documentation AI, provide intelligent suggestions for this clinical documentation field:

Field: ${currentField}
Current input: "${currentValue}"
Context: ${JSON.stringify(formData)}

Provide:
1. Auto-completion suggestions
2. Clinical enhancements
3. Standard terminology corrections
4. Best practice recommendations`;

        responseStructure = `Respond in this JSON format:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "type": "completion|correction|enhancement",
  "confidence": 0.9,
  "reasoning": "why these suggestions are relevant"
}`;
        break;

      default:
        throw new Error('Invalid action type');
    }

    console.log('Making Gemini API request for action:', action);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\n${responseStructure}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      
      // Handle quota exceeded error gracefully
      if (response.status === 429) {
        const quotaMessage = 'AI analysis temporarily unavailable due to quota limits. Please try again later or continue without AI assistance.';
        return new Response(JSON.stringify({ 
          error: quotaMessage,
          quotaExceeded: true,
          fallbackAvailable: true
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Gemini response:', generatedText);

    // Parse JSON response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-smart-templates function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});