'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, TextField, Chip, Stack, Switch, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import BrandToneProfile from './BrandToneProfile';
import type { CreativeConcept, CreativeConceptOutput } from '@platform/contracts';
import { Lightbulb, CheckCircle, Image as ImageIcon } from '@mui/icons-material';
import apiClient from '@/lib/apiClient';

interface CreativeEngineProps {
    onConceptsGenerated: (concepts: CreativeConcept[]) => void;
}

export default function CreativeEngine({ onConceptsGenerated }: CreativeEngineProps) {
    const t = useTranslations('CreativeEngine'); 
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the engine
    const [brandTone, setBrandTone] = useState<any>({ toneType: 'Professional' });
    const [offer, setOffer] = useState('');
    const [audience, setAudience] = useState(''); 
    const [painPoints, setPainPoints] = useState<string[]>([]);
    
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Campaign Details</Typography>
                            <Chip label="Step 1" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                         </Box>
                        
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Offer / Product</Typography>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>What are you promoting?</Typography>
                                <TextField 
                                    fullWidth 
                                    placeholder="e.g. Premium Eco-Friendly Cleaning Products" 
                                    value={offer} 
                                    onChange={(e) => setOffer(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Audience Pain Points</Typography>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>What problems does your audience face?</Typography>
                                <TextField 
                                    fullWidth 
                                    multiline
                                    rows={4}
                                    placeholder="e.g. Harsh chemicals harming family health, environmental concerns..." 
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Brand Tone Profile</Typography>
                            <Chip label="Step 2" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
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
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Creative Concepts'}
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>What You'll Get</Typography>
                        </Box>
                        
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography color="text.secondary">Creative Concepts</Typography>
                                <Typography fontWeight="bold">3-6</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography color="text.secondary">Format Variations</Typography>
                                <Typography fontWeight="bold">3</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                <Typography color="text.secondary">Prompt Templates</Typography>
                                <Typography fontWeight="bold">9-18</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* AI Image Toggle Card */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>AI Image Generation</Typography>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Enable AI Images</Typography>
                                <Typography variant="caption" color="text.secondary">Generate images with OpenAI DALL-E</Typography>
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>Concept Features</Typography>
                        </Box>
                        <List dense disablePadding>
                            {[
                                'Headline angles tied to pain points',
                                'Visual ideas for each concept',
                                'Primary text variations',
                                'Optimized CTAs per concept',
                                'Format-specific prompts (Feed, Stories, Reels)',
                                'Save to creative library'
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
