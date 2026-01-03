import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import apiClient from '@/lib/apiClient';
import { BrandService } from '@/services/brand.service';
import { Competitor } from '../components/CompetitorCard';

export const useCompetitors = () => {
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const queryClient = useQueryClient();
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState<'idle' | 'discovering'>('idle');

  // Fetch Competitors
  const { data: competitors = [], isLoading: isListLoading } = useQuery({
    queryKey: ['competitors', businessId, locationId],
    queryFn: async () => {
      if (!businessId) return [];
      
      // Use BrandService which we just updated to handle locationId
      const data = await BrandService.listCompetitors(businessId, locationId);
      
      return data.map((c: any) => ({
          ...c,
          // Ensure type is valid for our UI
          type: c.type || 'DIRECT_LOCAL'
      })) as Competitor[]; 
    },
    enabled: !!businessId
  });

  // Discover Mutation (Placeholder for now)
  const discoverMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      if (!businessId) throw new Error('No business ID');
      setDiscoveryStatus('discovering');
      const res = await apiClient.post(`/brands/${businessId}/competitors/discover`, {
        businessId,
        keywords,
        locationId // Pass locationId if discovery should be location aware? Assuming yes or backend ignores it.
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('brandRise.competitors.toast.discoverySuccess') || 'Discovery started!');
      queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
      setTimeout(() => setDiscoveryStatus('idle'), 2000);
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || t('brandRise.competitors.toast.discoveryError') || 'Discovery failed');
        setDiscoveryStatus('idle');
    }
  });

  // Add Mutation (Manual tracking/adding)
  const addMutation = useMutation({
    mutationFn: async (competitor: any) => {
        if (!businessId) throw new Error('No business ID');
        return apiClient.patch(`/brands/${businessId}/competitors/${competitor.id}`, {
            isUserAdded: true,
            isHidden: false
        });
    },
    onSuccess: () => {
        toast.success(t('brandRise.competitors.toast.addedSuccess') || 'Competitor added');
        queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
    }
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
        if (!businessId) throw new Error('No business ID');
        return apiClient.delete(`/brands/${businessId}/competitors/${id}`);
    },
    onSuccess: () => {
        toast.success(t('brandRise.competitors.toast.removedSuccess') || 'Competitor removed');
        queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
    }
  });

  // Extract Mutation
  const extractMutation = useMutation({
    mutationFn: async (id: string) => {
       setAnalyzingIds(prev => [...prev, id]);
       const res = await apiClient.post(`/brands/${businessId}/competitors/${id}/extract`);
       return res.data;
    },
    onSuccess: (data, id) => {
       toast.success(t('brandRise.competitors.toast.analysisStarted') || 'Analysis started');
       queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
       setAnalyzingIds(prev => prev.filter(pid => pid !== id));
    },
    onError: (err, id) => {
       toast.error(t('brandRise.competitors.toast.analysisFailed') || 'Analysis failed');
       setAnalyzingIds(prev => prev.filter(pid => pid !== id));
    }
  });

  return {
    competitors,
    isListLoading,
    discoverMutation,
    addMutation,
    removeMutation,
    extractMutation,
    analyzingIds,
    discoveryStatus
  };
};