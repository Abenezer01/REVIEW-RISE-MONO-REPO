'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, TextField, Chip, Stack, Switch, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import BrandToneProfile from './BrandToneProfile';
import type { CreativeConcept, CreativeConceptOutput } from '@platform/contracts';
import { Lightbulb, CheckCircle } from '@mui/icons-material';
import apiClient from '@/lib/apiClient';

interface CreativeEngineProps {
    onConceptsGenerated: (concepts: CreativeConcept[]) => void;
}

export default function CreativeEngine({ onConceptsGenerated }: CreativeEngineProps) {
    const t = useTranslations('ad-rise.creativeEngine');
    const [isLoading, setIsLoading] = useState(false);

    // State for the engine
    const [brandTone, setBrandTone] = useState<any>({ toneType: 'Professional' });
    const [offer, setOffer] = useState('');
    const [audience, setAudience] = useState('');
    const [painPoints] = useState<string[]>([]);
    
    // Settings
    const [enableAiImages, setEnableAiImages] = useState(false);

    const handleGenerate = async () => {
        if (!offer) return;

        setIsLoading(true);

        try {
            const response = await apiClient.post('/api/ai/creative-engine/concepts', {
                offer,
                audience: audience || 'General Audience', 
                painPoints: painPoints.length > 0 ? painPoints : [audience],
                tone: brandTone,
                enableImages: enableAiImages
            });

            const output: CreativeConceptOutput = response.data;

            onConceptsGenerated(output.concepts || []);
        } catch (error) {
            console.error('Failed to generate concepts', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Grid container spacing={3}>
            {/* Left Column: Inputs */}
            <Grid size={{ xs: 12, lg: 7 }}>
                <Stack spacing={3}>
                    {/* Campaign Details Card */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('form.campaignDetails')}</Typography>
                            <Chip label={t('form.step1')} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                         </Box>

                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{t('form.offerLabel')}</Typography>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('form.offerSubtitle')}</Typography>
                                <TextField
                                    fullWidth
                                    placeholder={t('form.offerPlaceholder')}
                                    value={offer}
                                    onChange={(e) => setOffer(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{t('form.audienceLabel')}</Typography>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{t('form.audienceSubtitle')}</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder={t('form.audiencePlaceholder')}
                                    value={audience} 
                                    onChange={(e) => setAudience(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Brand Tone Card */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('form.brandToneTitle')}</Typography>
                            <Chip label={t('form.step2')} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                         </Box>

                        <BrandToneProfile
                            value={brandTone}
                            onChange={setBrandTone}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={handleGenerate}
                            disabled={isLoading || !offer}
                            sx={{
                                mt: 4,
                                py: 2,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #FF4081 30%, #F50057 90%)',
                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : t('form.generateButton')}
                        </Button>
                    </Paper>
                </Stack>
            </Grid>

            {/* Right Column: Info & Settings */}
            <Grid size={{ xs: 12, lg: 5 }}>
                <Stack spacing={3}>
                    
                    {/* Summary Card */}
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: '50%', color: 'primary.main' }}>
                                <Lightbulb />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t('summary.title')}</Typography>
                        </Box>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography color="text.secondary">{t('summary.concepts')}</Typography>
                                <Typography fontWeight="bold">{t('summary.conceptsCount')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography color="text.secondary">{t('summary.formats')}</Typography>
                                <Typography fontWeight="bold">{t('summary.formatsCount')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography color="text.secondary">{t('summary.templates')}</Typography>
                                <Typography fontWeight="bold">{t('summary.templatesCount')}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* AI Image Toggle Card */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{t('settings.aiImageTitle')}</Typography>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{t('settings.enableAiImages')}</Typography>
                                <Typography variant="caption" color="text.secondary">{t('settings.enableAiImagesDesc')}</Typography>
                            </Box>
                            <Switch
                                checked={enableAiImages}
                                onChange={(e) => setEnableAiImages(e.target.checked)}
                                color="secondary"
                            />
                        </Box>
                    </Paper>

                    {/* Features List */}
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.dark', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>{t('features.title')}</Typography>
                        </Box>
                        <List dense disablePadding>
                            {[
                                t('features.item1'),
                                t('features.item2'),
                                t('features.item3'),
                                t('features.item4'),
                                t('features.item5'),
                                t('features.item6')
                            ].map((feature, i) => (
                                <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 32, color: 'secondary.light' }}>
                                        <CheckCircle fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2', color: 'rgba(255,255,255,0.8)' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                </Stack>
            </Grid>
        </Grid>
    );
}
