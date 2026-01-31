import { useState, useEffect } from 'react';

import { SERVICES } from '@/configs/services';
import apiClient from '@/lib/apiClient';

export const useBusinessId = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        // Fallback: Fetch first available business/location
        // apiClient returns { data: any[], meta: ... } for paginated responses like /locations
        const response = await apiClient.get<any>(`${SERVICES.admin.url}/locations`, {
          params: { limit: 1 }
        });

        // The interceptor unwraps the response. For paginated, response.data is { data, meta }
        const locations = response.data?.data || response.data || [];

        if (locations[0]?.businessId) {
          setBusinessId(locations[0].businessId);
        }
      } catch (error) {
        console.error('Failed to fetch business ID', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessId();
  }, []);

  return { businessId, loading };
};
