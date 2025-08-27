import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface HealthCheckResult {
  credentials: {
    apiKey: boolean;
    locationId: boolean;
    defaultCalendarId: boolean;
  };
  tests: {
    calendarGroups: { status: string; error: string | null };
    locationAccess: { status: string; error: string | null };
    calendarAccess: { status: string; error: string | null };
  };
  summary: {
    overall: string;
    message: string;
  };
}

export const useGHLHealthCheck = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: checkError } = await supabase.functions.invoke('ghl-health-check');
      
      if (checkError) {
        throw checkError;
      }
      
      setResult(data);
    } catch (err) {
      console.error('Health check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to run health check');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    runHealthCheck,
    isLoading,
    result,
    error
  };
};