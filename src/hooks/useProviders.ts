import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Provider {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  is_active?: boolean;
  specialty?: string;
}

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching providers from Supabase...');
      
      // Fetch only active providers with healthcare roles
      const { data, error: providerError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, role, is_active')
        .eq('is_active', true)
        .in('role', ['admin', 'overlord', 'doctor', 'provider'])
        .order('first_name');

      if (providerError) {
        throw new Error(providerError.message);
      }

      console.log('Providers fetched successfully:', data);
      setProviders(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch providers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (provider: Provider) => {
    if (provider.first_name || provider.last_name) {
      return `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
    }
    return provider.email || 'Unknown Provider';
  };

  const getProviderDisplayName = (provider: Provider) => {
    const name = getProviderName(provider);
    const specialty = provider.role === 'doctor' ? 'Dr.' : provider.role === 'overlord' ? 'Director' : '';
    return specialty ? `${specialty} ${name}` : name;
  };

  const getProviderById = (providerId: string) => {
    return providers.find(p => p.user_id === providerId || p.id === providerId);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    getProviderName,
    getProviderDisplayName,
    getProviderById,
  };
};