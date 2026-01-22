import { useState, useEffect } from 'react';

import { SERVICES } from '@/configs/services';
import apiClient from '@/lib/apiClient';

export const useBusinessId = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        // Try to get from localStorage first (if you had a selector)
        // const stored = localStorage.getItem('selectedBusinessId');
        // if (stored) {
        //   setBusinessId(stored);
        //   setLoading(false);
        //   return;
        // }

        // Fallback: Fetch first available business/location
        const response = await apiClient.get(`${SERVICES.admin.url}/locations`, {
          params: { limit: 1 }
        });

        if (response.data?.data?.[0]?.businessId) {
          setBusinessId(response.data.data[0].businessId);
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
