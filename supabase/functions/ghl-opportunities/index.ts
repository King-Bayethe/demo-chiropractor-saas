import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = Deno.env.get('GOHIGHLEVEL_API_KEY');

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };

    if (pathname.includes('reporting')) {
      // Get opportunities reporting data for dashboard
      const response = await fetch(`${GHL_API_BASE}/opportunities/`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      // Process opportunities data to match dashboard requirements
      const opportunities = data.opportunities || [];
      
      // Map GHL stages to our CRM stages
      const stageMapping = {
        'lead': 'Lead Captured',
        'consultation': 'Consult Scheduled', 
        'seen': 'Patient Seen',
        'billing': 'Billing Pending',
        'payment': 'Payment Collected',
      };

      const stageCounts = opportunities.reduce((acc: any, opp: any) => {
        const stage = stageMapping[opp.status] || opp.status;
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      const dashboardData = {
        totalOpportunities: opportunities.length,
        stageCounts,
        conversionRates: {
          leadToConsult: stageCounts['Consult Scheduled'] / stageCounts['Lead Captured'] * 100 || 0,
          consultToSeen: stageCounts['Patient Seen'] / stageCounts['Consult Scheduled'] * 100 || 0,
          seenToPaid: stageCounts['Payment Collected'] / stageCounts['Patient Seen'] * 100 || 0,
        },
        recentActivity: opportunities.slice(0, 10),
      };

      return new Response(JSON.stringify(dashboardData), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Regular opportunities fetch
    const response = await fetch(`${GHL_API_BASE}/opportunities/`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in ghl-opportunities function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);