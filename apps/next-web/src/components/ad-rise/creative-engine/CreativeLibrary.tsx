'use client';

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import type { CreativeConcept } from '@platform/contracts';
import { AutoAwesome } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface CreativeLibraryProps {
    onReuse: (concept: CreativeConcept) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CreativeLibrary({ onReuse }: CreativeLibraryProps) {
    const t = useTranslations('ad-rise.creativeEngine.library');

    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Paper sx={{ p: 5, maxWidth: 600, mx: 'auto', borderRadius: 4, borderStyle: 'dashed', borderColor: 'divider' }}>
                <Box sx={{ mb: 2, color: 'text.secondary' }}>
                     <AutoAwesome sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('comingSoon')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {t('description')}
                </Typography>
                <Button variant="contained" disabled>
                    {t('browse')}
                </Button>
            </Paper>
        </Box>
    );
}
