'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Alert } from '@mui/material';
import type { CreativeConcept } from '@platform/contracts';
import { AutoAwesome, Refresh } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/apiClient';
import ConceptResultCard from './ConceptResultCard';

interface CreativeLibraryProps {
    businessId: string | null;
    onReuse: (concept: CreativeConcept) => void;
}

export default function CreativeLibrary({ businessId, onReuse }: CreativeLibraryProps) {
    const t = useTranslations('ad-rise.creativeEngine.library');
    const [concepts, setConcepts] = useState<CreativeConcept[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLibrary = async () => {
        if (!businessId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/api/ai/creative-engine/library', {
                params: { businessId }
            });
            setConcepts(response.data.concepts || []);
        } catch (err) {
            console.error('Failed to fetch library', err);
            setError(t('fetchError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (businessId) {
            fetchLibrary();
        }
    }, [businessId]);

    if (!businessId) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (loading && concepts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="error" sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>{error}</Alert>
                <Button startIcon={<Refresh />} onClick={fetchLibrary}>{t('retry')}</Button>
            </Box>
        );
    }

    if (concepts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Paper sx={{ p: 5, maxWidth: 600, mx: 'auto', borderRadius: 4, borderStyle: 'dashed', borderColor: 'divider' }}>
                    <Box sx={{ mb: 2, color: 'text.secondary' }}>
                        <AutoAwesome sx={{ fontSize: 48, opacity: 0.5 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('emptyTitle')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('emptyDescription')}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button startIcon={<Refresh />} onClick={fetchLibrary} size="small">{t('refresh')}</Button>
            </Box>
            <Grid container spacing={3}>
                {concepts.map((concept) => (
                    <Grid item xs={12} md={6} xl={4} key={concept.id}>
                        <ConceptResultCard
                            concept={concept}
                            onGenerateImage={() => { }} // Library likely doesn't regenerate images yet, or reuse logic needed
                            isGeneratingImage={false}
                        // No save button in library view
                        />
                        <Box sx={{ mt: 1, textAlign: 'right' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => onReuse(concept)}
                            >
                                {t('reuse')}
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
