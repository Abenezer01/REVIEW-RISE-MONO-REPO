'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { PageHeader } from '@platform/shared-ui';
import { useBusinessId } from '@/hooks/useBusinessId';
import apiClient from '@/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { DiscoveryInput } from './components/DiscoveryInput';
import { CompetitorList } from './components/CompetitorList';

export default function CompetitorsPage() {
  const t = useTranslations('dashboard');
  const { businessId, loading: businessLoading } = useBusinessId();
  const queryClient = useQueryClient();

  // Fetch Competitors
  const { data: competitors = [], isLoading: isListLoading } = useQuery({
    queryKey: ['competitors', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const res = await apiClient.get(`/brands/${businessId}/competitors`);
      // Assuming response structure { data: { competitors: [...] } } or just { data: [...] }
      // Based on contract, it might be res.data.data (standard) or res.data.competitors
      // Let's assume standard response wrapper: { success: true, data: [...] }
      return res.data.data || []; 
    },
    enabled: !!businessId
  });

  // Discover Mutation
  const discoverMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      if (!businessId) throw new Error('No business ID');
      const res = await apiClient.post(`/brands/${businessId}/competitors/discover`, {
        businessId,
        keywords
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('brandRise.competitors.toast.discoverySuccess'));
      queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || t('brandRise.competitors.toast.discoveryError'));
    }
  });

  // Add Mutation (Manual tracking)
  const addMutation = useMutation({
    mutationFn: async (competitor: any) => {
        // This is primarily for manually moving discovered items to tracked if needed, 
        // OR adding a brand new one. 
        // If discovered items are already in DB but marked differently, we might need an update endpoint?
        // Actually, the discovery endpoint saves them to DB. 
        // If "Add" means "User manually adds", we use POST /.
        // If "Add" means "Take a discovered competitor and verify it?", they are already there?
        // Ah, the AC says "AC: User can add competitors manually".
        // And "From 5 keywords -> 10-20 ranked".
        // If they are discovered, they are likely already in DB.
        // Let's assume "Add" here is for the list action "Track" -> maybe sets `isUserAdded` to true?
        if (!businessId) throw new Error('No business ID');
        
        // If we tracking an existing discovered one, we might patch it?
        // Or if sending a new one.
        // Let's assume the List component passes a full object implies we want to "Track" it.
        // Based on backend routes: PATCH /:id can set isHidden=false or isUserAdded=true.
        // But if it's already there and just NEEDS extraction, maybe just leave it.
        
        // Let's implement ADD as "Manual Add" via input (later) OR "Track" via list button?
        // The list button in CompetitorList calls onAdd.
        
        // Use case: User clicks "Track" on an auto-discovered competitor (to confirm it).
        // Let's call PATCH to set isUserAdded = true.
        return apiClient.patch(`/brands/${businessId}/competitors/${competitor.id}`, {
            isUserAdded: true,
            isHidden: false
        });
    },
    onSuccess: () => {
        toast.success(t('brandRise.competitors.toast.addedSuccess'));
        queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
    }
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
        if (!businessId) throw new Error('No business ID');
        // If we "remove" a discovered one, we might just hide it? 
        // DELETE endpoint exists: router.delete('/:competitorId', ...)
        return apiClient.delete(`/brands/${businessId}/competitors/${id}`);
    },
    onSuccess: () => {
        toast.success(t('brandRise.competitors.toast.removedSuccess'));
        queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
    }
  });


  // Analysis State
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  // Extract Mutation
  const extractMutation = useMutation({
    mutationFn: async (id: string) => {
       setAnalyzingIds(prev => [...prev, id]);
       // Call extract endpoint
       const res = await apiClient.post(`/brands/${businessId}/competitors/${id}/extract`);
       return res.data;
    },
    onSuccess: (data, id) => {
       toast.success(t('brandRise.competitors.toast.analysisStarted')); // Or complete if sync
       queryClient.invalidateQueries({ queryKey: ['competitors', businessId] });
       setAnalyzingIds(prev => prev.filter(pid => pid !== id));
    },
    onError: (err, id) => {
       toast.error(t('brandRise.competitors.toast.analysisFailed'));
       setAnalyzingIds(prev => prev.filter(pid => pid !== id));
    }
  });

  if (businessLoading) return <CircularProgress />;
  if (!businessId) return <Alert severity="warning">No business selected</Alert>;

  return (
    <Box>
      <PageHeader
        title={t('brandRise.competitors.discoveryTitle')}
        subtitle={t('brandRise.competitors.discoverySubtitle')}
      />
      
      <Box sx={{ mt: 3, maxWidth: 800 }}>
        <DiscoveryInput 
            onDiscover={(keywords) => discoverMutation.mutate(keywords)} 
            isLoading={discoverMutation.isPending}
        />
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{t('brandRise.competitors.listTitle')}</Typography>
        
        {isListLoading ? (
            <CircularProgress />
        ) : (
            <CompetitorList 
                competitors={competitors}
                onAdd={(c) => addMutation.mutate(c)}
                onRemove={(id) => removeMutation.mutate(id)}
                onAnalyze={(id) => extractMutation.mutate(id)}
                analyzingIds={analyzingIds}
            />
        )}
      </Box>
    </Box>
  );
}