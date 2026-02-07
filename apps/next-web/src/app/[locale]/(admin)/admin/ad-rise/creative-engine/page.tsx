'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Tabs, Tab } from '@mui/material';
import { useTranslations } from 'next-intl';
import CreativeEngine from '@/components/ad-rise/creative-engine/CreativeEngine';
import CreativeLibrary from '@/components/ad-rise/creative-engine/CreativeLibrary';
import ConceptResultCard from '@/components/ad-rise/creative-engine/ConceptResultCard';
import type { CreativeConcept } from '@platform/contracts';
import { Image as ImageIcon, AutoAwesome, CollectionsBookmark } from '@mui/icons-material';
import apiClient from '@/lib/apiClient';

export default function CreativeEnginePage() {
    const t = useTranslations('ad-rise.creativeEngine');

    // Tabs
    const [activeTab, setActiveTab] = useState(0);

    // Results
    const [concepts, setConcepts] = useState<CreativeConcept[]>([]);
    const [isGeneratingImageId, setIsGeneratingImageId] = useState<string | null>(null);

    // View State
    const [view, setView] = useState<'input' | 'results'>('input');

    const handleConceptsGenerated = (newConcepts: CreativeConcept[]) => {
        setConcepts(newConcepts);
        setView('results');
    };

    const handleGenerateImage = async (conceptId: string, prompt: string) => {
        setIsGeneratingImageId(conceptId);

        try {
            const response = await apiClient.post('/api/ai/creative-engine/image', { prompt });
            const imageUrl = response.data.url;

            setConcepts(concepts.map(c => 
                c.id === conceptId ? { ...c, imageUrl } : c
            ));
        } catch (error) {
             console.error('Failed to generate image', error);
        } finally {
            setIsGeneratingImageId(null);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleReuseConcept = (concept: CreativeConcept) => {
        // Implementation for library reuse would go here
        setActiveTab(0);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (view === 'results') {
        return (
            <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                         <Button 
                            onClick={() => setView('input')}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        >
                            {t('backToEditor')}
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {t('generatedConcepts')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {t('generatedConceptsSubtitle')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setView('input')}
                    >
                        {t('startNewCampaign')}
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {concepts.map((concept, index) => (
                        <Grid size={{ xs: 12, md: 6, xl: 4 }} key={index}>
                             <ConceptResultCard 
                                concept={concept} 
                                onGenerateImage={(prompt) => handleGenerateImage(concept.id || index.toString(), prompt)} 
                                isGeneratingImage={isGeneratingImageId === (concept.id || index.toString())}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
             <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2, color: 'white', display: 'flex' }}>
                         <ImageIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {t('title')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('subtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="creative engine tabs">
                    <Tab icon={<AutoAwesome />} iconPosition="start" label={t('tabs.generator')} />
                    <Tab icon={<CollectionsBookmark />} iconPosition="start" label={t('tabs.library')} />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <CreativeEngine onConceptsGenerated={handleConceptsGenerated} />
            )}

            {activeTab === 1 && (
                <CreativeLibrary onReuse={handleReuseConcept} />
            )}
        </Box>
    );
}
