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
        const response = await apiClient.get<any[]>(`${SERVICES.admin.url}/locations`, {
          params: { limit: 1 }
        });

        if (response.data?.[0]?.businessId) {
          setBusinessId(response.data[0].businessId);
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
